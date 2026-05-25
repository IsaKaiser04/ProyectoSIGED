from django.db import models
from .enums import TipoIdentificacion
from apps.ubicacion.models.direccion import Direccion
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

    direccion_domicilio = models.ForeignKey(
            'ubicacion.Direccion',  # Apuntamiento como string para evitar problemas de importación
            on_delete=models.SET_NULL, 
            null=True, 
            blank=True, 
            # El truco de Django para herencia abstracta sin colisiones:
            related_name="%(app_label)s_%(class)s_direccion",#Espera que el related_name se resuelva dinámicamente según la clase hija, evitando colisiones entre perfiles.
            related_query_name="%(app_label)s_%(class)s_direcciones",#Espera a que los hijos resuelvan el related_query_name dinámicamente, evitando colisiones en consultas.
            verbose_name="Dirección Domiciliaria"
        )

    class Meta:
        abstract = True
        #No existe tabla usuario , solo sirve como base para otros modelos que hereden de ella.