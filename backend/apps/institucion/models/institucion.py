from django.db import models
from .enums import ZonasCoordinacion, Regimen, Sostenimiento, Modalidad, Jornada
from apps.ubicacion.models.direccion import Direccion 
class Institucion(models.Model):
    nombre = models.CharField(max_length=255, verbose_name="Nombre de la Institución")
    codigo_amie = models.CharField(max_length=50, unique=True, verbose_name="Código AMIE")
    ruc = models.CharField(max_length=13, unique=True, verbose_name="RUC")

    # Campos que mapean las dependencias
    zona_coordinacion = models.CharField(max_length=2, choices=ZonasCoordinacion.choices, verbose_name="Zona de Coordinación")
    regimen = models.CharField(max_length=2, choices=Regimen.choices, verbose_name="Régimen")
    sostenimiento = models.CharField(max_length=3, choices=Sostenimiento.choices, verbose_name="Sostenimiento")
    modalidad = models.CharField(max_length=2, choices=Modalidad.choices, verbose_name="Modalidad")
    jornada = models.CharField(max_length=3, choices=Jornada.choices, verbose_name="Jornada")

    es_activo = models.BooleanField(default=True, verbose_name="¿Activo?")

    # ──► ASOCIACIÓN CON DIRECCIÓN
    direccion = models.OneToOneField(
        Direccion, 
        on_delete=models.PROTECT, 
        related_name='institucion', 
        verbose_name="Dirección de la Sede"
    )
    class Meta:
        db_table = 'tbl_instituciones'
        verbose_name = 'Institución'
        verbose_name_plural = 'Instituciones'

    def __str__(self):
        return f"{self.nombre} ({self.codigo_amie})"