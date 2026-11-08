from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.calificaciones.models.tipoCalculo import TipoCalculo


class AsignaturaEvaluacion(models.Model):
    """
    Actividad evaluable de una asignatura del distributivo (equivale a la
    "ActividadAcademica" del diseño). El período NO lo elige el docente:
    se deriva de `fecha_entrega` en PeriodoService.asignar_periodo().
    """

    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True)   # legacy, ya no se usa
    fecha_fin = models.DateField(null=True, blank=True)      # legacy, ya no se usa
    activo = models.BooleanField(default=True)

    # --- NUEVOS ---------------------------------------------------------
    # null=True solo para no romper filas existentes; el service la exige.
    fecha_entrega = models.DateField(null=True, blank=True, db_index=True)

    tipo_calculo = models.CharField(
        max_length=20,
        choices=[
            (TipoCalculo.SIMPLE, TipoCalculo.SIMPLE.label),
            (TipoCalculo.PONDERADO, TipoCalculo.PONDERADO.label),
        ],
        default=TipoCalculo.SIMPLE,
    )
    # Fracción de 0 a 1 (0.30 = 30 %). Solo se usa si tipo_calculo == PONDERADO.
    peso = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.0001')), MaxValueValidator(Decimal('1'))],
    )
    # --------------------------------------------------------------------

    distributivo_asignatura = models.ForeignKey(
        'distributivos.DistributivoAsignatura',
        on_delete=models.CASCADE,
        related_name='evaluaciones',
    )
    periodo_academico = models.ForeignKey(
        'planificacion.PeriodoAcademico',
        on_delete=models.PROTECT,
        related_name='evaluaciones',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['fecha_entrega', 'id']
        constraints = [
            # Una actividad ponderada debe tener peso; una simple no.
            models.CheckConstraint(
                condition=(
                    models.Q(tipo_calculo='PONDERADO', peso__isnull=False)
                    | models.Q(tipo_calculo='SIMPLE', peso__isnull=True)
                ),
                name='actividad_peso_coherente_con_tipo_calculo',
            ),
        ]

    def __str__(self):
        return self.nombre