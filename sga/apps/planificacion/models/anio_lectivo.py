from django.db import models

from .enums import PeriodoTipo

class AnioLectivo(models.Model):
    nombre = models.CharField(max_length=100)
    fechaInicio = models.DateField()
    fechaFin = models.DateField()
    
    esActivo = models.BooleanField(default=True)

    # Referencia externa
    institucion = models.ForeignKey(
        'configuracion.Institucion',
        on_delete=models.PROTECT,
        related_name='anios_lectivos'
    )

    def __str__(self):
        return self.nombre


class PeriodoAcademico(models.Model):
    orden = models.CharField(max_length=10)
    nombre = models.CharField(max_length=100)
    fechaInicio = models.DateField()
    fechaFin = models.DateField()


    tipo = models.CharField(
        max_length=20,
        choices=PeriodoTipo.choices
    )

  
    anioLectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.CASCADE,
        related_name='periodos'
    )

    def __str__(self):
        return self.nombre