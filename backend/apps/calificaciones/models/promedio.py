from django.db import models


class Promedio(models.Model):
    valor = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    observacion = models.TextField(blank=True)
    fecha_calculo = models.DateTimeField(null=True, blank=True)

    distributivo_asignatura_id = models.PositiveBigIntegerField()
    asignatura_id = models.PositiveBigIntegerField(null=True, blank=True)
    matricula_id = models.PositiveBigIntegerField()

    evaluacion_rubrica = models.ForeignKey(
        'EvaluacionRubrica',
        on_delete=models.PROTECT,
        related_name='promedios',
        null=True,
        blank=True,
    )

    def __str__(self):
        return str(self.valor)
