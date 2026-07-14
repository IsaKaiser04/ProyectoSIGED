from django.db import models
from .enums import TipoIdentificacion

class Usuario(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    identificacion = models.CharField(max_length=20, unique=True)
    tipo_identificacion = models.CharField(max_length=20, choices=TipoIdentificacion.choices)
    fecha_nacimiento = models.DateField()
    celular = models.CharField(max_length=15, blank=True, null=True)
    correo_personal = models.EmailField(unique=True)

    class Meta:
        abstract = True