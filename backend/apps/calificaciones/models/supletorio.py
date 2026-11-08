from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Supletorio(models.Model):
    """
    Examen supletorio de una asignatura para un estudiante.

    Se modela aparte porque CalificacionMejora cuelga de UNA Calificacion
    (una actividad), mientras que el supletorio se decide sobre la nota
    final anual de la asignatura. Agregar en models/__init__.py.
    """

    valor = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('10'))],
    )
    observacion = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.PROTECT,
        related_name='supletorios',
    )
    distributivo_asignatura = models.ForeignKey(
        'distributivos.DistributivoAsignatura',
        on_delete=models.PROTECT,
        related_name='supletorios',
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['matricula', 'distributivo_asignatura'],
                name='unique_supletorio_por_matricula_asignatura',
            )
        ]

    def __str__(self):
        return str(self.valor)