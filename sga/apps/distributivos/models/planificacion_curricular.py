from django.core.validators import FileExtensionValidator
from django.db import models

from .distributivo_asignatura import DistributivoAsignatura
from .enums import PlanificacionEstado


class PlanificacionCurricular(models.Model):
    distributivo_asignatura = models.OneToOneField(
        DistributivoAsignatura,
        on_delete=models.CASCADE,
        related_name='planificacion_curricular'
    )
    archivo_pdf = models.FileField(
        upload_to='planificaciones_curriculares/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(['pdf'])]
    )
    observacion = models.TextField(blank=True)
    estado = models.CharField(
        max_length=20,
        choices=PlanificacionEstado.choices,
        default=PlanificacionEstado.BORRADOR
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Planificacion Curricular'
        verbose_name_plural = 'Planificaciones Curriculares'

    def __str__(self):
        return f'Planificacion {self.distributivo_asignatura_id} - {self.estado}'