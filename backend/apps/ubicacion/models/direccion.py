from django.db import models

class Direccion(models.Model):
    calle_principal = models.CharField(
        max_length=150, 
        verbose_name="Calle Principal"
    )
    calle_secundaria = models.CharField(
        max_length=150, 
        verbose_name="Calle Secundaria"
    )
    numero_casa = models.CharField(
        max_length=20, 
        verbose_name="Número de Casa/Departamento"
    )
    referencia = models.TextField(
        verbose_name="Referencia Domiciliaria"
    )
    parroquia = models.ForeignKey(
        'Parroquia', 
        on_delete=models.PROTECT, 
        related_name='direcciones',
        verbose_name="Parroquia Domiciliaria"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Activa"
    )

    class Meta:
        db_table = 'tbl_direcciones'
        verbose_name = 'Dirección'
        verbose_name_plural = 'Direcciones'

    def __str__(self):
        return f"{self.calle_principal} y {self.calle_secundaria} (# {self.numero_casa})"