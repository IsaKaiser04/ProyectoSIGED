from django.db import models
from .enums import MatriculaPeriodoTipo


class MatriculaPeriodo(models.Model):
    nombre = models.CharField(max_length=100, blank=True, default='')
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    tipo = models.CharField(max_length=20, choices=MatriculaPeriodoTipo.choices, default=MatriculaPeriodoTipo.ORDINARIA)

    institucion = models.ForeignKey(
        'institucion.Institucion',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='periodos_matricula'
    )
    educacion_nivel = models.ForeignKey(
        'planificacion.EducacionNivel',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='periodos_matricula'
    )
    anio_lectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='periodos_matricula'
    )

    class Meta:
        db_table = 'matricula_periodo'
        verbose_name = 'Periodo de Matricula'
        verbose_name_plural = 'Periodos de Matricula'

    def __str__(self):
        return f"{self.nombre or self.tipo} | {self.fecha_inicio.date()} - {self.fecha_fin.date()}"
