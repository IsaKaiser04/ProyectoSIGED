from django.core.exceptions import ValidationError
from django.db import models


class JornadaHora(models.Model):
    nombre = models.CharField(max_length=100)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    institucion = models.ForeignKey(
        'institucion.Institucion',
        on_delete=models.PROTECT,
        related_name='jornadas_hora',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['hora_inicio']
        verbose_name = 'Jornada Hora'
        verbose_name_plural = 'Jornadas Hora'

    def clean(self):
        if self.hora_inicio and self.hora_fin and self.hora_inicio >= self.hora_fin:
            raise ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})

    def __str__(self):
        return f'{self.nombre} ({self.hora_inicio} - {self.hora_fin})'
