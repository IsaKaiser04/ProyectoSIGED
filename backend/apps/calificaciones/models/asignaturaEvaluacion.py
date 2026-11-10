from django.db import models


class AsignaturaEvaluacion(models.Model):
    """
    Actividad evaluable de una asignatura del distributivo.

    - El período NO lo elige el docente: se deriva de `fecha_entrega`
      (PeriodoService.asignar_periodo).
    - La sección (`evaluacion_categoria`) sale de la rúbrica del año lectivo; su peso
      decide cuánto vale la actividad en el promedio del período.
    """

    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    # null=True solo para no romper filas existentes; CalificacionService la exige.
    fecha_entrega = models.DateField(null=True, blank=True, db_index=True)

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
    # PROTECT: una sección con actividades no se puede borrar de la rúbrica.
    evaluacion_categoria = models.ForeignKey(
        'EvaluacionCategoria',
        on_delete=models.PROTECT,
        related_name='actividades',
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['fecha_entrega', 'id']

    def __str__(self):
        return self.nombre
