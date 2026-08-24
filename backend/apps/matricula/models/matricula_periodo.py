from django.db import models
from .enums import MatriculaPeriodoTipo
from apps.planificacion.models.enums import NivelEducativo


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
    educacion_nivel = models.CharField(
        max_length=30,
        choices=[(e.value, e.name) for e in NivelEducativo],
        null=True, blank=True,
        help_text="Nivel educativo del periodo de matrícula"
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
