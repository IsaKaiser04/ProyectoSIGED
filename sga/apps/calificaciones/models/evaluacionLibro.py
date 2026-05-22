from django.db import models


class EvaluacionLibro(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    institucion_id = models.PositiveBigIntegerField(null=True, blank=True)
    anio_lectivo_id = models.PositiveBigIntegerField(null=True, blank=True)
    grado_id = models.PositiveBigIntegerField(null=True, blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
