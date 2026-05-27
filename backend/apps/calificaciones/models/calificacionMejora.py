from django.db import models


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
    calificacion_mejora_tipo = models.ForeignKey(
        'CalificacionMejoraTipo',
        on_delete=models.PROTECT,
        related_name='mejoras',
    )

    def __str__(self):
        return str(self.valor)
