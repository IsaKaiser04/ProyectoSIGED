from django.db import models


class Distributivo(models.Model):
    anio_lectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.PROTECT,
        related_name='distributivos',
        null=True,
        blank=True
    )
    docente = models.ForeignKey(
        'actoresAcademicos.Docente',
        on_delete=models.PROTECT,
        related_name='distributivos',
        null=True,
        blank=True
    )
    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Distributivo'
        verbose_name_plural = 'Distributivos'

    def __str__(self):
        return f'{self.docente} - {self.anio_lectivo}'
