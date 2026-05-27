from django.db import models
from .enums import RolTipo


class Permiso(models.Model):

    nombre = models.CharField(
        max_length=100
    )

    def __str__(self):
        return self.nombre


class RolPermiso(models.Model):

    rol = models.CharField(
        max_length=30,
        choices=RolTipo.choices
    )

    permiso = models.ForeignKey(
        Permiso,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.rol} - {self.permiso.nombre}"