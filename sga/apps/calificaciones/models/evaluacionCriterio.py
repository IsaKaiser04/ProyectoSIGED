from django.db import models


class EvaluacionCriterio(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    orden = models.PositiveIntegerField(default=1)
    puntaje_maximo = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    activo = models.BooleanField(default=True)

    evaluacion_rubrica = models.ForeignKey(
        'EvaluacionRubrica',
        on_delete=models.CASCADE,
        related_name='criterios',
    )

    def __str__(self):
        return self.nombre
