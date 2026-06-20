from django.db import models

class Parroquia(models.Model):
    class TipoParroquiaChoices(models.TextChoices):
        URBANA = 'URBANA', 'Urbana'
        RURAL = 'RURAL', 'Rural'

    nombre = models.CharField(
        max_length=100, 
        verbose_name="Nombre de la Parroquia"
    )
    canton = models.ForeignKey(
        'Canton', 
        on_delete=models.CASCADE, 
        related_name='parroquias',
        verbose_name="Cantón Asociado"
    )
    tipo_parroquia = models.CharField(
        max_length=10,
        choices=TipoParroquiaChoices.choices,
        default=TipoParroquiaChoices.URBANA,
        verbose_name="Tipo de Parroquia"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )

    class Meta:
        db_table = 'tbl_parroquias'
        verbose_name = 'Parroquia'
        verbose_name_plural = 'Parroquias'
        ordering = ['nombre']
        unique_together = ('nombre', 'canton')

    def __str__(self):
        return self.nombre