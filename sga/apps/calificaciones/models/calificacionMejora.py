from django.db import models
from apps.calificaciones.models.calificacionMejoraTipo import CalificacionMejoraTipo
from apps.calificaciones.models.calificacion import Calificacion


class CalificacionMejora(models.Model):
    notaCuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    notaCualitativa = models.CharField(max_length=100, blank=True)
    observacion = models.TextField(blank=True)

    calificacion = models.ForeignKey(
        Calificacion,
        on_delete=models.CASCADE,
        related_name='mejoras',
    )
    calificacion_mejora_tipo = models.CharField(
        max_length=20,
        choices=CalificacionMejoraTipo.choices,
        default=CalificacionMejoraTipo.REFUERZO,
    )

    def __str__(self):
        return str(self.notaCuantitativa)
