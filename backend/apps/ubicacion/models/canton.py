from django.db import models

class Canton(models.Model):
    nombre = models.CharField(
        max_length=100, 
        verbose_name="Nombre del Cantón"
    )
    provincia = models.ForeignKey(
        'Provincia', 
        on_delete=models.CASCADE, 
        related_name='cantones',
        verbose_name="Provincia Asociada"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )

    class Meta:
        db_table = 'tbl_cantones'
        verbose_name = 'Cantón'
        verbose_name_plural = 'Cantones'
        ordering = ['nombre']
        unique_together = ('nombre', 'provincia')

    def __str__(self):
        return self.nombre