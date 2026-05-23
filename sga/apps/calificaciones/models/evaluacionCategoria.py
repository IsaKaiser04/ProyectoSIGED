from django.db import models
from apps.calificaciones.models.tipoCalculo import TipoCalculo

class EvaluacionCategoria(models.Model):
    nombre = models.CharField(max_length=150)
    nota_minima = models.IntegerField()
    nota_maxima = models.IntegerField()
    
    tipo_calculo = models.CharField(
        max_length=20,
        choices=TipoCalculo.choices,
        default=TipoCalculo.SIMPLE
    )

    def __str__(self):
        return self.nombre
