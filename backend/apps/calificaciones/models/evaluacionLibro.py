from django.db import models


class EvaluacionLibro(models.Model):
    """
    Rúbrica de actividades de un año lectivo. Una sola por año y aplica a todos los
    grados y a todos los períodos. La institución sale de `anio_lectivo.institucion`.
    Sus secciones (Tareas, Lecciones, ...) son EvaluacionCategoria.
    """

    nombre = models.CharField(max_length=150)
    # null=True solo para no romper filas viejas; RubricaService siempre lo asigna.
    anio_lectivo = models.OneToOneField(
        'planificacion.AnioLectivo',
        on_delete=models.CASCADE,
        related_name='evaluacion_libro',
        null=True,
        blank=True,
    )

    def __str__(self):
        return self.nombre
