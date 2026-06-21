from rest_framework import generics
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer

class CuentaListAPIView(generics.ListAPIView):
    """Permite al Administrador del sistema ver todas las cuentas creadas."""
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer

class CuentaDetailUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Permite ver el detalle, editar el estado (activo/inactivo) o cambiar datos de una cuenta específica."""
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer