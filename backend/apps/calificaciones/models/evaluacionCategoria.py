from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class EvaluacionCategoria(models.Model):
    """
    Sección de la rúbrica de actividades (Tareas, Lecciones, Evaluación...).

    Es igual para todos los períodos del año. La nota de la sección en un período es el
    promedio simple de sus actividades; la nota del período es la suma de cada sección
    por su `peso`. Las secciones de una rúbrica suman 1 (100 %).
    """

    nombre = models.CharField(max_length=150)
    # Fracción de 0 a 1 (0.25 = 25 %).
    peso = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=Decimal('0'),
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('1'))],
    )
    orden = models.PositiveSmallIntegerField(default=0)

    # null=True solo para no romper filas viejas; RubricaService siempre lo asigna.
    libro = models.ForeignKey(
        'EvaluacionLibro',
        on_delete=models.CASCADE,
        related_name='secciones',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['orden', 'id']

    def __str__(self):
        return self.nombre
