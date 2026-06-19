from django.core.exceptions import ValidationError
from django.db import models

# Descomentar cuando el módulo InstitucionEducativa esté integrado
# from apps.instituciones.models import InstitucionEducativa


class JornadaHora(models.Model):
    nombre = models.CharField(max_length=100)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    # Referencia temporal mientras el módulo InstitucionEducativa
    # aún no se encuentra integrado.
    institucion_educativa_referencia = models.CharField(
        max_length=150,
        null=True,
        blank=True,
        help_text='TODO: replace with FK to InstitucionEducativa when module exists.'
    )

    # Cuando se implemente la relación con InstitucionEducativa,
    # se debe eliminar el campo `institucion_educativa_referencia`
    # y descomentar el siguiente código:
    # institucion_educativa = models.ForeignKey(
    #     InstitucionEducativa,
    #     on_delete=models.CASCADE
    # )

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