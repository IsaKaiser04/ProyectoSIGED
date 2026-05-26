from django.db import models
from apps.calificaciones.models.promedio import Promedio


class PromedioCategoria(models.Model):
    notaCuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    notaCualitativa = models.CharField(max_length=255)

    
    promedio = models.ForeignKey(
        Promedio,
        on_delete=models.CASCADE,
        related_name='promedios_categoria',
    )

    promedio_categoria_padre = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='subcategorias',
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.notaCuantitativa)
