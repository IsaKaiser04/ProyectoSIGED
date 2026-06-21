from django.db import models
from apps.ubicacion.models import Direccion  # Importamos tu modelo de ubicación

class Universidad(models.Model):
    nombre = models.CharField(max_length=255, verbose_name="Nombre de la Universidad")
    # Asociación con Dirección
    direccion = models.ForeignKey(
        Direccion, 
        models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Dirección de la Universidad",
        related_name="universidades"
    )

    class Meta:
        db_table = 'tbl_universidades'
        verbose_name = 'Universidad'
        verbose_name_plural = 'Universidades'

    def __str__(self):
        return self.nombre