from django.db import models
from .usuario import Usuario
from .cuenta import Cuenta
from .enums import TipoContrato, TipoDedicacion

from apps.ubicacion.models.direccion import Direccion
from apps.institucion.models.institucion import Institucion

class Docente(Usuario):

    cuenta = models.OneToOneField(
        Cuenta,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='perfil_docente'
    )
    
    especialidad = models.CharField(max_length=100)
    
    fecha_ingreso = models.DateField()
    
    tipo_contrato = models.CharField(max_length=3, choices=TipoContrato.choices, verbose_name="Tipo de Contrato")
    
    tipo_dedicacion = models.CharField(max_length=2, choices=TipoDedicacion.choices, verbose_name="Tipo de Dedicación")
    
    institucion = models.ForeignKey(Institucion,on_delete=models.PROTECT,related_name='docentes')

    direccion_domicilio = models.ForeignKey('ubicacion.Direccion',on_delete=models.SET_NULL,null=True,blank=True,related_name='docente_direccion',verbose_name="Dirección Domiciliaria")

    @property
    def anios_experiencia(self):
        from datetime import date
        return date.today().year - self.fecha_ingreso.year
    
    def __str__(self):
        return f"Docente: {self.nombres} {self.apellidos} - {self.especialidad}"