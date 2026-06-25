from django.db import models
from django.core.exceptions import ValidationError

from .enums import DiasSemana
from .jornada_hora import JornadaHora


class BloqueHorario(models.Model):
    paralelo = models.ForeignKey(
        'planificacion.Paralelo',
        on_delete=models.PROTECT,
        related_name='bloques_horarios'
    )
    jornada_hora = models.ForeignKey(
        JornadaHora,
        on_delete=models.PROTECT,
        related_name='bloques_horarios'
    )
    dia_semana = models.CharField(max_length=10, choices=DiasSemana.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    orden = models.IntegerField(help_text="Número de orden del bloque (1ra hora, 2da hora...)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['paralelo', 'dia_semana', 'orden']
        verbose_name = 'Bloque Horario'
        verbose_name_plural = 'Bloques Horarios'
        constraints = [
            models.UniqueConstraint(
                fields=['paralelo', 'dia_semana', 'hora_inicio'],
                name='unique_bloque_paralelo'
            )
        ]

    def clean(self):
        if self.hora_inicio and self.hora_fin and self.hora_inicio >= self.hora_fin:
            raise ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})

        if self.jornada_hora_id:
            jornada = self.jornada_hora
            if jornada.hora_inicio and self.hora_inicio and self.hora_inicio < jornada.hora_inicio:
                raise ValidationError({'hora_inicio': 'La hora inicio debe estar dentro de la jornada.'})
            if jornada.hora_fin and self.hora_fin and self.hora_fin > jornada.hora_fin:
                raise ValidationError({'hora_fin': 'La hora fin debe estar dentro de la jornada.'})

    def __str__(self):
        return f'{self.paralelo} - {self.dia_semana} {self.hora_inicio}-{self.hora_fin} ({self.orden}a hora)'
