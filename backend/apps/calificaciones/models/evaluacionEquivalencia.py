from django.db import models
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica

class EvaluacionEquivalencia(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    evaluacion_rubrica = models.ForeignKey(
        EvaluacionRubrica,
        on_delete=models.CASCADE, 
        related_name='equivalencias'
    )

    def __str__(self):
        return self.nombre