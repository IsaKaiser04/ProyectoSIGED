from django.db import models

class Provincia(models.Model):
    nombre = models.CharField(
        max_length=100, 
        verbose_name="Nombre de la Provincia"
    )
    pais = models.ForeignKey(
        'Pais', 
        on_delete=models.CASCADE, 
        related_name='provincias',
        verbose_name="País Asociado"
    )

    class Meta:
        db_table = 'tbl_provincias'
        verbose_name = 'Provincia'
        verbose_name_plural = 'Provincias'
        ordering = ['nombre']
        # Evita que se duplique la misma provincia dentro del mismo país
        unique_together = ('nombre', 'pais')

    def __str__(self):
        return f"{self.nombre} ({self.pais.nombre})"