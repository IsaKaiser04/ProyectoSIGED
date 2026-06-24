"""Importaciones necesarias para definir el modelo"""   
from django.db import models
from .usuario import Usuario
from .cuenta import Cuenta
from apps.ubicacion.models.direccion import Direccion
from apps.institucion.models.institucion import Institucion
"""Modelo que representa a un estudiante, hereda de
   Usuario y agrega un campo para la foto del 
   estudiante."""
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

    institucion = models.ForeignKey(Institucion,on_delete=models.PROTECT,related_name='estudiantes')

    direccion_domicilio = models.ForeignKey('ubicacion.Direccion',on_delete=models.SET_NULL,null=True,blank=True,related_name='estudiante_direccion',verbose_name="Dirección Domiciliaria")


    #Método para representar el objeto como una cadena
    def __str__(self):
        return f"{self.nombres} {self.apellidos}"
