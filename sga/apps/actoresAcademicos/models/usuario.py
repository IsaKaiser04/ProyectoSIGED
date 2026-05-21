from django.db import models
from .enums import TipoIdentificacion
# Clase abstracta que representa a un usuario común, con campos básicos de identificación y contacto.

class Usuario(models.Model):

    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)

    identificacion = models.CharField(
        max_length=20,
        unique=True
    )

    tipo_identificacion = models.CharField(
        max_length=20,
        choices=TipoIdentificacion.choices
    )

    fecha_nacimiento = models.DateField()

    celular = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    correo_personal = models.EmailField(
        unique=True
    )

    class Meta:
        abstract = True
        #No existe tabla usuario , solo sirve como base para otros modelos que hereden de ella.