from django.db import models


class Incidencia(models.Model):
    asunto = models.CharField(max_length=150)
    detalle = models.TextField()
    archivo = models.FileField(upload_to='incidencias/', null=True, blank=True)
    notificar = models.BooleanField(default=False)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    incidencia_tipo = models.ForeignKey(
        'IncidenciaTipo',
        on_delete=models.PROTECT,
        related_name='incidencias',
    )
    calificaciones = models.ManyToManyField(
        'Calificacion',
        related_name='incidencias',
        blank=True,
    )

    def __str__(self):
        return self.asunto
