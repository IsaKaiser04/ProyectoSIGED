from django.db import models
from apps.institucion.models.institucion import Institucion

class PlanEstudio(models.Model):
    nombre = models.CharField(max_length=200)
    esActivo = models.BooleanField(default=True)

# 💡 Conexión obligatoria con la Institución
    institucion = models.ForeignKey(
        Institucion, 
        on_delete=models.CASCADE, 
        related_name='planes_estudio'
    )

    def __str__(self):
        return f"{self.nombre} - {self.institucion.nombre}"

    class Meta:
        verbose_name = 'Plan de Estudio'
        verbose_name_plural = 'Planes de Estudio'


class Grado(models.Model):
    nombre = models.CharField(max_length=100)
    planEstudio = models.ForeignKey(PlanEstudio, on_delete=models.CASCADE, related_name='grados')
    educacionNivel = models.ForeignKey('EducacionNivel', on_delete=models.CASCADE, related_name='grados')
    educacionSubNivel = models.ForeignKey('EducacionSubNivel', on_delete=models.CASCADE, related_name='grados')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Grado'
        verbose_name_plural = 'Grados'


class Asignatura(models.Model):
    nombre = models.CharField(max_length=200)
    periodoPedagogicoSemanaMinimo = models.IntegerField()
    grado = models.ForeignKey(Grado, on_delete=models.CASCADE, related_name='asignaturas')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Asignatura'
        verbose_name_plural = 'Asignaturas'