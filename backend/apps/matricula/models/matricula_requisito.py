from django.db import models
from .enums import MatriculaRequisitoTipo


class MatriculaRequisito(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=500, blank=True, default='')
    tipo = models.CharField(max_length=20, choices=MatriculaRequisitoTipo.choices, default=MatriculaRequisitoTipo.INFORMATIVO)
    es_obligatorio = models.BooleanField(default=True)

    periodo = models.ForeignKey(
        'MatriculaPeriodo',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='requisitos_definidos'
    )
    institucion = models.ForeignKey(
        'institucion.Institucion',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='requisitos_config'
    )
    educacion_nivel = models.ForeignKey(
        'planificacion.EducacionNivel',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='requisitos_config'
    )

    class Meta:
        db_table = 'matricula_requisito'
        verbose_name = 'Requisito de Matricula'
        verbose_name_plural = 'Requisitos de Matricula'

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"
