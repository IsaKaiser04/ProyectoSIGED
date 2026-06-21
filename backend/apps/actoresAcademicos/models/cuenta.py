from django.db import models
from .enums import RolTipo

class Cuenta(models.Model):

    nombre_usuario = models.CharField(
        max_length=50, 
        unique=True)
    
    contrasena = models.CharField(
        max_length=255
    )

    correo_institucional = models.EmailField(
        unique=True
    )

    rol = models.CharField(
        max_length=30,
        choices=RolTipo.choices,
        default=RolTipo.ESTUDIANTE
    )

    es_activo = models.BooleanField(
        default=True
    )

    def __str__(self):# Devuelve una representación legible de la cuenta, mostrando el nombre de usuario y su rol.
        return f"{self.nombre_usuario} ({self.get_rol_display()})"