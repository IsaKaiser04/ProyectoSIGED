from django.db import models


class Calificacion(models.Model):
    cuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    cualitativa = models.CharField(max_length=50)

    # CORREGIDO: Era Asignatura, ahora AsignaturaOfertada (más lógico)
    asignaturaOfertada = models.ForeignKey(
        'AsignaturaOfertada',
        on_delete=models.CASCADE,
        related_name='calificaciones'
    )

    # estudiante = models.ForeignKey('actoresAcademicos.Estudiante', on_delete=models.CASCADE, related_name='calificaciones')
    # periodoAcademico = models.ForeignKey('PeriodoAcademico', on_delete=models.CASCADE, related_name='calificaciones')

    def __str__(self):
        return f"{self.cuantitativa} - {self.cualitativa}"

    class Meta:
        verbose_name = 'Calificación'
        verbose_name_plural = 'Calificaciones'