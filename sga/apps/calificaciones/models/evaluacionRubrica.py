from django.db import models


class EvaluacionRubrica(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    institucion_id = models.PositiveBigIntegerField(null=True, blank=True)
    activo = models.BooleanField(default=True)

    evaluacion_tipo = models.ForeignKey(
        'EvaluacionTipo',
        on_delete=models.PROTECT,
        related_name='rubricas',
    )
    libro = models.ForeignKey(
        'EvaluacionLibro',
        on_delete=models.CASCADE,
        related_name='rubricas',
    )

    def __str__(self):
        return self.nombre
