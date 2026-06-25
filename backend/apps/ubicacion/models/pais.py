from django.db import models

class Pais(models.Model):
    nombre = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name="Nombre del País"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )

    class Meta:
        db_table = 'tbl_paises'
        verbose_name = 'País'
        verbose_name_plural = 'Países'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre