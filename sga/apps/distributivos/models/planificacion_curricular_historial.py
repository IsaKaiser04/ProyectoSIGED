from django.db import models

from .enums import PlanificacionEstado
from .planificacion_curricular import PlanificacionCurricular


class PlanificacionCurricularHistorial(models.Model):
    planificacion_curricular = models.ForeignKey(
        PlanificacionCurricular,
        on_delete=models.CASCADE,
        related_name='historiales'
    )
    fecha = models.DateTimeField(auto_now_add=True)
    estado_anterior = models.CharField(max_length=20, choices=PlanificacionEstado.choices)
    estado_actual = models.CharField(max_length=20, choices=PlanificacionEstado.choices)
    observacion = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name = 'Planificacion Curricular Historial'
        verbose_name_plural = 'Planificaciones Curriculares Historial'

    def __str__(self):
        return f'{self.planificacion_curricular_id} - {self.estado_anterior} -> {self.estado_actual}'