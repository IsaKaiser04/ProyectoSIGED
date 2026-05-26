from django.db import models
from apps.calificaciones.models.promedioCategoria import PromedioCategoria


class Calificacion(models.Model):
    notaCuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    notaCualitativa = models.CharField(max_length=100, blank=True, null=True)
    observacion = models.TextField(blank=True, null=True)
    id_EVA = models.PositiveBigIntegerField(null=True, blank=True)

    promedio_categoria = models.ForeignKey(
        PromedioCategoria,
        on_delete=models.CASCADE,
        related_name='calificaciones',
    )

    def __str__(self):
        return str(self.notaCuantitativa)
