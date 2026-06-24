from django.core.exceptions import ValidationError
from django.db import models

from .adaptacion_curricular import AdaptacionCurricular
from .enums import AdaptacionEstado


class AdaptacionCurricularPlanificacion(models.Model):
    adaptacion_curricular = models.OneToOneField(
        AdaptacionCurricular,
        on_delete=models.CASCADE,
        related_name='planificacion'
    )
    distributivo_asignatura = models.ForeignKey(
        'distributivos.DistributivoAsignatura',
        on_delete=models.PROTECT,
        related_name='adaptaciones_planificacion',
        null=True,
        blank=True
    )
    archivo = models.FileField(upload_to='dece/planificaciones/', blank=True, null=True)
    comentario = models.TextField()
    estado = models.CharField(max_length=20, choices=AdaptacionEstado.choices, default=AdaptacionEstado.BORRADOR)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Adaptacion Curricular Planificacion'
        verbose_name_plural = 'Adaptaciones Curriculares Planificaciones'

    def clean(self):
        if self.comentario is not None and not self.comentario.strip():
            raise ValidationError({'comentario': 'El comentario no puede estar vacio.'})

    def __str__(self):
        return f'{self.adaptacion_curricular_id} - {self.estado}'
