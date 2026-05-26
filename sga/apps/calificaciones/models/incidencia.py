from django.db import models
from apps.calificaciones.models.incidenciaTipo import IncidenciaTipo
from apps.calificaciones.models.calificacion import Calificacion


class Incidencia(models.Model):
    asunto = models.CharField(max_length=150)
    detalle = models.TextField()
    archivo = models.FileField(upload_to='incidencias/', null=True, blank=True)
    notificar = models.BooleanField(default=False)


    incidencia_tipo = models.CharField(
        max_length=20,
        choices=IncidenciaTipo.choices,
        default=IncidenciaTipo.ASISTENCIAL
    )

    calidicacion = models.ForeignKey(
        Calificacion,
        on_delete=models.CASCADE,
        related_name='incidencias',
    )
    
    def __str__(self):
        return self.asunto
