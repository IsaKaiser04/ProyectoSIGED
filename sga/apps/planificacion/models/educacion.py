from django.db import models

class EducacionNivel(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20)
    periodoPedagogicoMinutos = models.IntegerField()
    periodoPedagogicoSemanaMinimo = models.IntegerField()

    def __str__(self):
        return self.nombre


class EducacionSubNivel(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20)
    periodoPedagogicoSemanaMinimo = models.IntegerField()
    
    nivel = models.ForeignKey(
        EducacionNivel,
        on_delete=models.CASCADE,
        related_name='subniveles'
    )

    def __str__(self):
        return self.nombre