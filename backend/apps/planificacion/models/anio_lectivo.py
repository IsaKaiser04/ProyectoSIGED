from django.db import models
from .enums import PeriodoTipo, AnioLectivoEstado


class AnioLectivo(models.Model):
    nombre = models.CharField(max_length=50)
    fechaInicio = models.DateField()
    fechaFin = models.DateField()
    estado = models.CharField(
        max_length=20,
        choices=AnioLectivoEstado.choices,
        default=AnioLectivoEstado.BORRADOR
    )

    institucion = models.ForeignKey('institucion.Institucion', on_delete=models.CASCADE, related_name='anios_lectivos', null=True, blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Año Lectivo'
        verbose_name_plural = 'Años Lectivos'


class PeriodoAcademico(models.Model):
    orden = models.CharField(max_length=10)
    nombre = models.CharField(max_length=100)
    fechaInicio = models.DateField()
    fechaFin = models.DateField()
    periodoTipo = models.CharField(max_length=20, choices=PeriodoTipo.choices)
    anioLectivo = models.ForeignKey(AnioLectivo, on_delete=models.CASCADE, related_name='periodos_academicos')

    def __str__(self):
        return f"{self.nombre} - {self.anioLectivo.nombre}"

    class Meta:
        verbose_name = 'Período Académico'
        verbose_name_plural = 'Períodos Académicos'