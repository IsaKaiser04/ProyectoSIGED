from django.db import models


class ClaseEstado(models.TextChoices):
    PROGRAMADO = 'Programado', 'Programado'
    EN_CURSO = 'En curso', 'En curso'
    FINALIZADO = 'Finalizado', 'Finalizado'


class AsistenciaTipo(models.TextChoices):
    ASISTENCIA = 'Asistencia', 'Asistencia'
    INASISTENCIA = 'Inasistencia', 'Inasistencia'
    JUSTIFICADO = 'Justificado', 'Justificado'
    ATRASADO = 'Atrasado', 'Atrasado'


class Clase(models.Model):
    """Clase dictada en una fecha y horario (US-042)."""
    tema = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=500, blank=True, default='')
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, choices=ClaseEstado.choices, default=ClaseEstado.PROGRAMADO)

    # Relaciones según el diagrama de clases (Asistencia EUS-04)
    distributivo_asignatura = models.ForeignKey(
        'distributivos.DistributivoAsignatura',
        on_delete=models.PROTECT,
        related_name='clases',
    )
    horario = models.ForeignKey(
        'distributivos.Horario',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clases',
    )
    # Cada clase pertenece a un período académico (bimestre/trimestre/quimestre)
    periodo_academico = models.ForeignKey(
        'planificacion.PeriodoAcademico',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clases',
    )

    class Meta:
        db_table = 'clase'
        verbose_name = 'Clase'
        verbose_name_plural = 'Clases'
        ordering = ['-fecha', 'hora_inicio']
        constraints = [
            models.UniqueConstraint(
                fields=['distributivo_asignatura', 'horario', 'fecha'],
                name='unique_clase_asignatura_horario_fecha',
            )
        ]

    def __str__(self):
        return f"{self.tema} - {self.fecha}"


class Asistencia(models.Model):
    observacion = models.CharField(max_length=500, blank=True)
    notificar = models.BooleanField(default=False)
    tipo = models.CharField(max_length=20, choices=AsistenciaTipo.choices, default=AsistenciaTipo.ASISTENCIA)
    
    clase = models.ForeignKey(Clase, on_delete=models.CASCADE, related_name='asistencias')
    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.CASCADE,
        related_name='asistencias',
        db_column='matricula_id'
    )

    class Meta:
        db_table = 'asistencia'
        verbose_name = 'Asistencia'
        verbose_name_plural = 'Asistencias'
        constraints = [
            models.UniqueConstraint(
                fields=['clase', 'matricula'],
                name='unique_asistencia_clase_matricula',
            )
        ]

    def __str__(self):
        return f"Asistencia #{self.id} - {self.tipo}"


class Incidencia(models.Model):
    descripcion = models.TextField()
    asistencia = models.ForeignKey(Asistencia, on_delete=models.CASCADE, related_name='incidencias')

    class Meta:
        db_table = 'incidencia'
        verbose_name = 'Incidencia'
        verbose_name_plural = 'Incidencias'

    def __str__(self):
        return f"Incidencia #{self.id}"