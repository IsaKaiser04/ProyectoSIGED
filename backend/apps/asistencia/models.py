from django.db import models
from django.conf import settings


class ClaseEstado(models.TextChoices):
    PROGRAMADO = 'PROGRAMADO', 'Programado'
    EN_CURSO = 'EN_CURSO', 'En curso'
    FINALIZADO = 'FINALIZADO', 'Finalizado'
    CANCELADO = 'CANCELADO', 'Cancelado'


class AsistenciaTipo(models.TextChoices):
    ASISTENCIA = 'ASISTENCIA', 'Asistencia'
    INASISTENCIA = 'INASISTENCIA', 'Inasistencia'
    JUSTIFICADO = 'JUSTIFICADO', 'Justificado'
    ATRASADO = 'ATRASADO', 'Atrasado'


class IncidenciaTipo(models.TextChoices):
    COMPORTAMIENTO = 'COMPORTAMIENTO', 'Comportamiento'
    ACADEMICO = 'ACADEMICO', 'Académico'
    ASISTENCIAL = 'ASISTENCIAL', 'Asistencial'


class JustificacionEstado(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    APROBADA = 'APROBADA', 'Aprobada'
    RECHAZADA = 'RECHAZADA', 'Rechazada'


class Clase(models.Model):
    tema = models.CharField(max_length=255, blank=True, default='')
    descripcion = models.CharField(max_length=500, blank=True, default='')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(
        max_length=20,
        choices=ClaseEstado.choices,
        default=ClaseEstado.PROGRAMADO
    )

    # FKs temporales a otros módulos (no tocamos esos módulos)
    distributivo_asignatura_id = models.IntegerField()
    horario_id = models.IntegerField(null=True, blank=True)
    distributivo_evaluacion_id = models.IntegerField(null=True, blank=True)

    # Auditoría
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clases_creadas'
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clase'
        verbose_name = 'Clase'
        verbose_name_plural = 'Clases'
        ordering = ['-fecha', 'hora_inicio']

    def __str__(self):
        return f"{self.tema or 'Sin tema'} - {self.fecha}"


class Asistencia(models.Model):
    observacion = models.CharField(max_length=500, blank=True, default='')
    notificar = models.BooleanField(default=False)
    tipo = models.CharField(
        max_length=20,
        choices=AsistenciaTipo.choices,
        default=AsistenciaTipo.ASISTENCIA
    )

    # Relaciones
    clase = models.ForeignKey(
        Clase,
        on_delete=models.CASCADE,
        related_name='asistencias'
    )
    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.CASCADE,
        related_name='asistencias',
        db_column='matricula_id'
    )

    # Auditoría - ¿Quién marcó y cuándo?
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='asistencias_registradas'
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'asistencia'
        verbose_name = 'Asistencia'
        verbose_name_plural = 'Asistencias'
        unique_together = ('clase', 'matricula')  # Un registro por alumno por clase

    def __str__(self):
        return f"Asistencia #{self.id} - {self.get_tipo_display()}"


class Incidencia(models.Model):
    """Incidencia local del módulo de asistencia.
    Nota: Cuando el módulo de calificaciones esté listo,
    se puede migrar esta tabla o crear FK hacia calificaciones.Incidencia.
    Por ahora es auto-contenida para no depender de otros módulos.
    """
    asunto = models.CharField(max_length=150)
    detalle = models.TextField(blank=True, default='')
    archivo = models.FileField(
        upload_to='incidencias_asistencia/%Y/%m/',
        null=True,
        blank=True
    )
    notificar = models.BooleanField(default=False)
    tipo = models.CharField(
        max_length=20,
        choices=IncidenciaTipo.choices,
        default=IncidenciaTipo.ASISTENCIAL
    )
    estado = models.CharField(
        max_length=20,
        default='REGISTRADA'
    )

    # Relación con la asistencia que originó la incidencia
    asistencia = models.ForeignKey(
        Asistencia,
        on_delete=models.CASCADE,
        related_name='incidencias',
        null=True,
        blank=True
    )

    # También puede vincularse directamente a una matricula (sin asistencia específica)
    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.CASCADE,
        related_name='incidencias_asistencia',
        null=True,
        blank=True,
        db_column='matricula_id'
    )

    # Puente futuro al módulo de calificaciones (sin tocar ese módulo)
    incidencia_calificacion_id = models.IntegerField(null=True, blank=True)

    # Auditoría
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incidencias_registradas'
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'incidencia_asistencia'
        verbose_name = 'Incidencia'
        verbose_name_plural = 'Incidencias'
        ordering = ['-fecha_registro']

    def __str__(self):
        return f"Incidencia #{self.id} - {self.asunto}"


class Justificacion(models.Model):
    """Solicitud de justificación de falta.
    Flujo: Representante sube PDF -> Secretaría aprueba/rechaza -> Cambia estado asistencia.
    """
    estado = models.CharField(
        max_length=20,
        choices=JustificacionEstado.choices,
        default=JustificacionEstado.PENDIENTE
    )
    motivo = models.TextField()
    archivo = models.FileField(
        upload_to='justificaciones/%Y/%m/',
        null=True,
        blank=True
    )
    observacion_secretaria = models.TextField(blank=True, default='')

    # Relación con la asistencia que se justifica
    asistencia = models.ForeignKey(
        Asistencia,
        on_delete=models.CASCADE,
        related_name='justificaciones'
    )

    # Auditoría
    solicitado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='justificaciones_solicitadas'
    )
    resuelto_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='justificaciones_resueltas'
    )
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'justificacion'
        verbose_name = 'Justificación'
        verbose_name_plural = 'Justificaciones'
        ordering = ['-fecha_solicitud']

    def __str__(self):
        return f"Justificación #{self.id} - {self.get_estado_display()}"
