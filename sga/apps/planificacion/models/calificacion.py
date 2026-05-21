from django.db import models

class Calificacion(models.Model):
    cuantitativa = models.FloatField(null=True, blank=True)
    cualitativa = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    asignaturaOfertada = models.ForeignKey(
        'planificacion.AsignaturaOfertada',
        on_delete=models.PROTECT,
        related_name='calificaciones'
    )

    def __str__(self):
        return f"{self.asignaturaOfertada} - {self.cuantitativa}"