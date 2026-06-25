from django.db import models


class PromedioCategoria(models.Model):
    valor = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    observacion = models.TextField(blank=True)

    promedio = models.ForeignKey(
        'Promedio',
        on_delete=models.CASCADE,
        related_name='promedios_categoria',
    )
    evaluacion_categoria = models.ForeignKey(
        'EvaluacionCategoria',
        on_delete=models.PROTECT,
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
        return str(self.valor)
