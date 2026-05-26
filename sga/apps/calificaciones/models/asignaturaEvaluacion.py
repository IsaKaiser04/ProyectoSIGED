from django.db import models
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.promedioCategoria import PromedioCategoria


class AsignaturaEvaluacion(models.Model):
    distributivo_asignatura_id = models.PositiveBigIntegerField()
    
    evaluacion_categoria = models.ForeignKey(
        EvaluacionCategoria,
        on_delete=models.CASCADE,
        related_name='asignaturas_evaluacion',
    )
    
    promedio_categoria = models.ForeignKey(
        PromedioCategoria,
        on_delete=models.CASCADE,
        related_name='asignaturas_evaluaciones',
    )

    def __str__(self):
        return f"AsignaturaEvaluacion {self.id} - Asignatura ID: {self.distributivo_asignatura_id}"
