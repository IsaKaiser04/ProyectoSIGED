from django.db import models
from .usuario import Usuario
from .cuenta import Cuenta

# Modelo que representa a un estudiante, hereda de Usuario y agrega un campo para la foto del estudiante.
class Estudiante(Usuario):
    cuenta = models.OneToOneField(
        Cuenta, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='perfil_estudiante'
    )

    foto = models.ImageField(
        upload_to='estudiantes/',
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"