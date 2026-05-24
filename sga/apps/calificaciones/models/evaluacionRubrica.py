from django.db import models
from apps.calificaciones.models.evaluacionTipo import EvaluacionTipo

class EvaluacionRubrica(models.Model):
    nombre = models.CharField(max_length=150)
    esActivo = models.BooleanField(default=True)
    institucion_id = models.PositiveBigIntegerField(null=True, blank=True)
    asignatura_id = models.PositiveBigIntegerField(null=True, blank=True)
    grado_id = models.PositiveBigIntegerField(null=True, blank=True)


    evaluacion_tipo = models.CharField(
        max_length=20,
        choices=EvaluacionTipo.choices,
        default=EvaluacionTipo.CUALITATIVA
    )

    def __str__(self):
        return self.nombre
