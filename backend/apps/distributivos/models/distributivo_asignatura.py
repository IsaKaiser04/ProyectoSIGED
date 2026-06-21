from django.db import models

from .distributivo import Distributivo


class DistributivoAsignatura(models.Model):
    distributivo = models.ForeignKey(
        Distributivo,
        on_delete=models.CASCADE,
        related_name='asignaturas',
        null=True,
        blank=True
    )
    asignatura_ofertada = models.ForeignKey(
        'planificacion.AsignaturaOfertada',
        on_delete=models.PROTECT,
        related_name='distributivos_asignaturas',
        null=True,
        blank=True
    )
    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Distributivo Asignatura'
        verbose_name_plural = 'Distributivos Asignatura'

    def __str__(self):
        return f'{self.distributivo} - {self.asignatura_ofertada}'
