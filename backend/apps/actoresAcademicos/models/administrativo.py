from django.db import models
from .usuario import Usuario
from .cuenta import Cuenta

class Autoridad(Usuario):
    cuenta = models.OneToOneField(Cuenta, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfil_autoridad')
    correo_institucional = models.EmailField(unique=True, blank=True, null=True)
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos} - Autoridad"

class Secretaria(Usuario):
    cuenta = models.OneToOneField(Cuenta, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfil_secretaria')
    correo_institucional = models.EmailField(unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos} - Secretaria"

class Administrador(Usuario):
    cuenta = models.OneToOneField(Cuenta, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfil_administrador')
    rol_administrado = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos} - Administrador"

class Dece(Usuario):
    cuenta = models.OneToOneField(Cuenta, on_delete=models.SET_NULL, null=True, blank=True, related_name='perfil_dece')
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos} - DECE"
    

#on_delete: significa que si la cuenta asociada se borra, el perfil de dece se quedará sin cuenta pero no se eliminará (SET_NULL). Esto es útil para mantener el historial del dece aunque su cuenta ya no exista.