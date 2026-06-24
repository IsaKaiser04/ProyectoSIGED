from django.core.exceptions import ValidationError
from django.db import models

from .enums import DiscapacidadGrado, DiscapacidadTipo


class AdaptacionCurricular(models.Model):
    matricula = models.OneToOneField(
        'matricula.Matricula',
        on_delete=models.CASCADE,
        related_name='adaptacion_curricular',
        null=True,
        blank=True
    )
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
        return f'{self.matricula} - {self.necesidad_educativa}'
