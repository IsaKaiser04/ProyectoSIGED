from django.core.exceptions import ValidationError
from django.db import models

from .adaptacion_curricular import AdaptacionCurricular


class AdaptacionCurricularEvidencia(models.Model):
    adaptacion_curricular = models.ForeignKey(
        AdaptacionCurricular,
        on_delete=models.CASCADE,
        related_name='evidencias'
    )
    archivo = models.FileField(upload_to='dece/evidencias/')
    descripcion = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Adaptacion Curricular Evidencia'
        verbose_name_plural = 'Adaptaciones Curriculares Evidencias'

    def clean(self):
        if self.descripcion is not None and not self.descripcion.strip():
            raise ValidationError({'descripcion': 'La descripcion no puede estar vacia.'})

    def __str__(self):
        return self.descripcion