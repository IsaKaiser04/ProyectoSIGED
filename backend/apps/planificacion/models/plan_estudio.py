from django.db import models
from .enums import NivelEducativo, SubNivelEducativo, ModalidadBachillerato


class PlanEstudio(models.Model):
    nombre = models.CharField(max_length=200)
    esActivo = models.BooleanField(default=True)
    descripcion = models.TextField(blank=True)
    duracionAnios = models.IntegerField(default=1)

    institucion = models.ForeignKey('institucion.Institucion', on_delete=models.CASCADE, related_name='planes_estudio', null=True, blank=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Plan de Estudio'
        verbose_name_plural = 'Planes de Estudio'


class Grado(models.Model):
    nombre = models.CharField(max_length=100)
    planEstudio = models.ForeignKey(PlanEstudio, on_delete=models.CASCADE, related_name='grados')

    nivel = models.CharField(
        max_length=30,
        choices=[(e.value, e.name) for e in NivelEducativo],
        help_text="Nivel educativo del grado"
    )

    subnivel = models.CharField(
        max_length=50,
        choices=[(e.value, e.name) for e in SubNivelEducativo],
        help_text="Subnivel educativo del grado"
    )

    modalidad = models.CharField(
        max_length=30,
        choices=[(e.value, e.name) for e in ModalidadBachillerato],
        null=True,
        blank=True,
        help_text="Solo aplica para Bachillerato"
    )

    anioGrado = models.IntegerField(
        help_text="Número de año dentro del subnivel (ej: 1°, 2°, 3°)"
    )

    institucion = models.ForeignKey('institucion.Institucion', on_delete=models.CASCADE, related_name='grados', null=True, blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.get_nivel_display()}"

    class Meta:
        verbose_name = 'Grado'
        verbose_name_plural = 'Grados'
        unique_together = ['planEstudio', 'nivel', 'subnivel', 'anioGrado']


class Asignatura(models.Model):
    nombre = models.CharField(max_length=200)
    periodoPedagogicoSemanaMinimo = models.IntegerField()
    grado = models.ForeignKey(Grado, on_delete=models.CASCADE, related_name='asignaturas')

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Asignatura'
        verbose_name_plural = 'Asignaturas'