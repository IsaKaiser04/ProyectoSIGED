from django.db import models
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia


class EvaluacionCriterio(models.Model):
    cuantitativaMinima = models.IntegerField()
    cuantitativaMaxima = models.IntegerField()
    cualitativa = models.CharField(max_length=150)
    descripcion = models.TextField()


    evaluacion_rubrica = models.ForeignKey(
        EvaluacionRubrica,
        on_delete=models.CASCADE,
        related_name='criterios',
    )
    evaluacion_equivalencia = models.ForeignKey(
        EvaluacionEquivalencia,
        on_delete=models.CASCADE,
        related_name='criterios',
    )
    
    def __str__(self):
        return self.descripcion
