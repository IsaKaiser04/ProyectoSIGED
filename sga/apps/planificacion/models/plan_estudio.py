from django.db import models

#from .educacion import EducacionNivel, EducacionSubNivel

class PlanEstudio(models.Model):
    nombre = models.CharField(max_length=100)
    esActivo = models.BooleanField(default=True)
    
    nivel = models.ForeignKey(
        'planificacion.EducacionNivel',
        on_delete=models.PROTECT,
        related_name='planes_estudio'
    )

    # Referencia externa a Institucion (otra app)
    institucion = models.ForeignKey(
        'configuracion.Institucion',
        on_delete=models.PROTECT,
        related_name='planes_estudio'
    )

    def __str__(self):
        return self.nombre


class Grado(models.Model):
    nombre = models.CharField(max_length=100)
    
    planEstudio = models.ForeignKey(
        PlanEstudio,
        on_delete=models.CASCADE,
        related_name='grados'
    )


    subNivel = models.ForeignKey(
        'planificacion.EducacionSubNivel',
        on_delete=models.CASCADE,
        related_name='grados'
    )

    def __str__(self):
        return self.nombre


class Asignatura(models.Model):
    nombre = models.CharField(max_length=100)
    periodoPedagogicoSemanaMinimo = models.IntegerField()
    
    grado = models.ForeignKey(
        Grado,
        on_delete=models.CASCADE,
        related_name='asignaturas'
    )

    def __str__(self):
        return self.nombre