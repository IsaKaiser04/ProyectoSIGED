from django.db import models
from django.core.exceptions import ValidationError
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
    paralelo = models.ForeignKey(
        'planificacion.Paralelo',
        on_delete=models.PROTECT,
        related_name='distributivos_asignatura',
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
        constraints = [
            models.UniqueConstraint(
                fields=['distributivo', 'asignatura_ofertada', 'paralelo'],
                name='unique_distributivo_asignatura_paralelo'
            )
        ]

    def clean(self):
        super().clean()
        if self.asignatura_ofertada and self.paralelo:
            if self.asignatura_ofertada.gradoOfertado_id != self.paralelo.gradoOfertado_id:
                raise ValidationError({
                    'paralelo': 'El grado ofertado del paralelo debe coincidir con el de la asignatura ofertada.'
                })

    def __str__(self):
        paralelo_nombre = f" ({self.paralelo.nombre})" if self.paralelo else ""
        return f'{self.distributivo} - {self.asignatura_ofertada}{paralelo_nombre}'

