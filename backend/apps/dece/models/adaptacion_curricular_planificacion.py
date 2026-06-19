from django.core.exceptions import ValidationError
from django.db import models

from .adaptacion_curricular import AdaptacionCurricular
from .enums import AdaptacionEstado

# Descomentar cuando el modulo Distributivos este intregrado
# from apps.distributivos.models import DistributivoAsignatura

class AdaptacionCurricularPlanificacion(models.Model):
    adaptacion_curricular = models.OneToOneField(
        AdaptacionCurricular,
        on_delete=models.CASCADE,
        related_name='planificacion'
    )

    # Referencia temporal mientras el módulo Distributivos
    # Aún no se encuentra integrado.
    distributivo_asignatura_referencia = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text='TODO: replace with FK to DistributivoAsignatura when module exists.'
    )

    # Cuando se implemente la relación con DistributivoAsignatura, se debe eliminar el campo distributivo_asignatura_referencia y descomentar el siguiente código:
    # distributivo_asignatura = models.ForeignKey(
    #    DistributivoAsignatura,
    #    on_delete=models.CASCADE
    #    related_name='adaptaciones_planificacion'
    #)

    archivo = models.FileField(upload_to='dece/planificaciones/')
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