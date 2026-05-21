from django.db import models
from .usuario import Usuario
from .cuenta import Cuenta


class Docente(Usuario):

    cuenta = models.OneToOneField(
        Cuenta,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='perfil_docente'
    )

    correo_institucional = models.EmailField(
        unique=True
    )

    especialidad = models.CharField(
        max_length=100
    )

    fecha_ingreso = models.DateField()
    #se ingresa la fecha de la siguiente manera: 2020-01-01

    @property
    def anios_experiencia(self):
        from datetime import date
        return date.today().year - self.fecha_ingreso.year

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"