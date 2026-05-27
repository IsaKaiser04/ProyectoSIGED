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
    tema = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=500)
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, choices=ClaseEstado.choices, default=ClaseEstado.PROGRAMADO)
    
    # apps distributivos y calificaciones no existen aun -> IntegerField
    distributivo_asignatura_id = models.IntegerField()
    horario_id = models.IntegerField(null=True, blank=True)
    distributivo_evaluacion_id = models.IntegerField()

    class Meta:
        db_table = 'clase'
        verbose_name = 'Clase'
        verbose_name_plural = 'Clases'

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