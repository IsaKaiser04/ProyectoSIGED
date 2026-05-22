from django.db import models


class EvaluacionEquivalencia(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    valor_minimo = models.DecimalField(max_digits=6, decimal_places=2)
    valor_maximo = models.DecimalField(max_digits=6, decimal_places=2)
    activo = models.BooleanField(default=True)

    evaluacion_tipo = models.ForeignKey(
        'EvaluacionTipo',
        on_delete=models.PROTECT,
        related_name='equivalencias',
    )
    evaluacion_criterio = models.ForeignKey(
        'EvaluacionCriterio',
        on_delete=models.CASCADE,
        related_name='equivalencias',
    )

    def __str__(self):
        return self.nombre
