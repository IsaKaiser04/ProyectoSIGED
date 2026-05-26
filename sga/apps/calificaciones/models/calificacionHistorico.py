from django.db import models
from apps.calificaciones.models.calificacion import Calificacion


class CalificacionHistorico(models.Model):
    notaCuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    notaCualitativa = models.CharField(max_length=100, blank=True)
    observacion = models.TextField(blank=True)

    calificacion = models.ForeignKey(
        Calificacion,
        on_delete=models.CASCADE,
        related_name='historicos',
    )

    def __str__(self):
        return f'{self.notaCuantitativa} - {self.notaCualitativa}'