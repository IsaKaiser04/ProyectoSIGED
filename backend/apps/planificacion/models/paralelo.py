from django.db import models


class Paralelo(models.Model):
    nombre = models.CharField(max_length=10)
    cuposMaximo = models.IntegerField()
    cuposOcupados = models.IntegerField(default=0)
    gradoOfertado = models.ForeignKey('GradoOfertado', on_delete=models.CASCADE, related_name='paralelos')

    # docenteTutor = models.ForeignKey('actoresAcademicos.Docente', on_delete=models.SET_NULL, null=True, blank=True, related_name='paralelos_tutor')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Paralelo'
        verbose_name_plural = 'Paralelos'