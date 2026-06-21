from django.core.exceptions import ValidationError
from django.db import models

from .distributivo import Distributivo
from .distributivo_asignatura import DistributivoAsignatura
from .enums import DiasSemana, HorarioTipo
from .jornada_hora import JornadaHora


class Horario(models.Model):
    distributivo = models.ForeignKey(
        Distributivo,
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    distributivo_asignatura = models.ForeignKey(
        DistributivoAsignatura,
        on_delete=models.CASCADE,
        related_name='horarios'
    )
    jornada_hora = models.ForeignKey(
        JornadaHora,
        on_delete=models.PROTECT,
        related_name='horarios'
    )
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    observacion = models.TextField(blank=True)
    tipo_horario = models.CharField(max_length=20, choices=HorarioTipo.choices)
    dia_semana = models.CharField(max_length=20, choices=DiasSemana.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['dia_semana', 'hora_inicio']
        verbose_name = 'Horario'
        verbose_name_plural = 'Horarios'

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
        return f'{self.dia_semana} {self.hora_inicio}-{self.hora_fin}'