from django.db import models

class Paralelo(models.Model):
    nombre = models.CharField(max_length=10)
    cuposMaximo = models.IntegerField()
    cuposOcupados = models.IntegerField(default=0)

    gradoOfertado = models.ForeignKey(
        'planificacion.GradoOfertado',
        on_delete=models.CASCADE,
        related_name='paralelos'
    )

    # Asociación opcional (0..n ──── 1)
    docenteTutor = models.ForeignKey(
        'actoresAcademicos.Docente',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='paralelos_tutor'
    )

    def __str__(self):
        return self.nombre