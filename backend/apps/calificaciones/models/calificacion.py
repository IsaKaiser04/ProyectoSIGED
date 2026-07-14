from django.db import models


class Calificacion(models.Model):
    valor = models.DecimalField(max_digits=6, decimal_places=2)
    observacion = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    asignatura_evaluacion = models.ForeignKey(
        'AsignaturaEvaluacion',
        on_delete=models.PROTECT,
        related_name='calificaciones',
    )
    promedio_categoria = models.ForeignKey(
        'PromedioCategoria',
        on_delete=models.CASCADE,
        related_name='calificaciones',
    )
    matricula = models.ForeignKey(
        'matricula.Matricula',
        on_delete=models.PROTECT,
        related_name='calificaciones',
    )

    def __str__(self):
        return str(self.valor)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['asignatura_evaluacion', 'matricula'],
                name='unique_calificacion_por_evaluacion_matricula',
            )
        ]
