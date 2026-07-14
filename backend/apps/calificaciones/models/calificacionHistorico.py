from django.db import models


class CalificacionHistorico(models.Model):
    valor_anterior = models.DecimalField(max_digits=6, decimal_places=2)
    valor_nuevo = models.DecimalField(max_digits=6, decimal_places=2)
    observacion = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    calificacion = models.ForeignKey(
        'Calificacion',
        on_delete=models.CASCADE,
        related_name='historicos',
    )

    def __str__(self):
        return f'{self.valor_anterior} -> {self.valor_nuevo}'
