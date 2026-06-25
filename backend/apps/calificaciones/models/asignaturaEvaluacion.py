from django.db import models


class AsignaturaEvaluacion(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)
    activo = models.BooleanField(default=True)

    distributivo_asignatura_id = models.PositiveBigIntegerField()
    entrega_id = models.PositiveBigIntegerField(null=True, blank=True)

    def __str__(self):
        return self.nombre
