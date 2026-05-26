from django.db import models


class EvaluacionLibro(models.Model):
    nombre = models.CharField(max_length=150)
    institucion_id = models.PositiveBigIntegerField(null=True, blank=True)
    anio_lectivo_id = models.PositiveBigIntegerField(null=True, blank=True)
    grado_id = models.PositiveBigIntegerField(null=True, blank=True)
    

    def __str__(self):
        return self.nombre
