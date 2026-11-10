from django.db import models


class PromedioCategoria(models.Model):
    """Promedio de un estudiante en una sección de la rúbrica, dentro de un Promedio de período."""

    valor = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    observacion = models.TextField(blank=True)

    promedio = models.ForeignKey(
        'Promedio',
        on_delete=models.CASCADE,
        related_name='promedios_categoria',
    )
    # CASCADE: es un dato derivado; si la sección desaparece, se recalcula.
    evaluacion_categoria = models.ForeignKey(
        'EvaluacionCategoria',
        on_delete=models.CASCADE,
        related_name='promedios_categoria',
    )

    def __str__(self):
        return str(self.valor)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['promedio', 'evaluacion_categoria'],
                name='unique_promedio_categoria_por_seccion',
            )
        ]
