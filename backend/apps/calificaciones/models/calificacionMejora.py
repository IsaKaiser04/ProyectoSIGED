from django.db import models
from apps.calificaciones.models.calificacionesMejoraTipo import CalificacionMejoraTipo


class CalificacionMejora(models.Model):
    valor = models.DecimalField(max_digits=6, decimal_places=2)
    observacion = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    aprobado = models.BooleanField(default=False)

    calificacion = models.ForeignKey(
        'Calificacion',
        on_delete=models.CASCADE,
        related_name='mejoras',
    )
    tipo = models.CharField(
        max_length=20,
        choices=CalificacionMejoraTipo.choices,
        default=CalificacionMejoraTipo.MEJORA,
    )

    def __str__(self):
        return str(self.valor)
