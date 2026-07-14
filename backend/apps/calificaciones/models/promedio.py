from django.db import models


class Promedio(models.Model):
    valor = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    observacion = models.TextField(blank=True)
    fecha_calculo = models.DateTimeField(null=True, blank=True)

    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.PROTECT,
        related_name='promedios',
    )
    distributivo_asignatura = models.ForeignKey(
        'distributivos.DistributivoAsignatura',
        on_delete=models.PROTECT,
        related_name='promedios',
    )
    periodo_academico = models.ForeignKey(
        'planificacion.PeriodoAcademico',
        on_delete=models.PROTECT,
        related_name='promedios',
        null=True,
        blank=True,
    )
    evaluacion_rubrica = models.ForeignKey(
        'EvaluacionRubrica',
        on_delete=models.PROTECT,
        related_name='promedios',
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.valor)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['matricula', 'distributivo_asignatura', 'periodo_academico'],
                name='unique_promedio_por_matricula_asignatura_periodo',
            )
        ]
