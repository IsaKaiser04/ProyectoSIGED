from django.core.exceptions import ValidationError
from django.db import models

from .enums import DiscapacidadGrado, DiscapacidadTipo

# Descomentar cuando el modulo Matricula este intregrado
# from apps.matriculas.models import Matricula

class AdaptacionCurricular(models.Model):
    # Referencia temporal mientras el módulo Matricula
    # aún no se encuentra integrado.
    matricula_referencia = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text='TODO: replace with FK to Matricula when module exists.'
    )

    # Cuando se implemente la relación con Matricula, se debe eliminar el campo matricula_referencia
    # y descomentar el siguiente código:
    # matricula = models.ForeignKey(
    #    Matricula,
    #    on_delete=models.CASCADE
    #    related_name='adaptaciones_curriculares'
    # )

    discapacidad_tipo = models.CharField(max_length=20, choices=DiscapacidadTipo.choices)
    discapacidad_grado = models.CharField(max_length=20, choices=DiscapacidadGrado.choices)
    necesidad_educativa = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Adaptacion Curricular'
        verbose_name_plural = 'Adaptaciones Curriculares'

    def clean(self):
        if self.necesidad_educativa is not None and not self.necesidad_educativa.strip():
            raise ValidationError({'necesidad_educativa': 'La necesidad educativa no puede estar vacia.'})

    def __str__(self):
        return self.necesidad_educativa