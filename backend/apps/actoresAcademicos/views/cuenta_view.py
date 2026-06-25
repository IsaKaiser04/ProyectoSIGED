from rest_framework import generics
from rest_framework.exceptions import ValidationError
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
from apps.actoresAcademicos.models.permissions import EsAdministradorGlobal
from apps.actoresAcademicos.services.cuenta_service import CuentaService

class CuentaListAPIView(generics.ListAPIView):
    """Permite al Administrador del sistema ver todas las cuentas creadas."""
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer
    permission_classes = [EsAdministradorGlobal]

class CuentaDetailUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Permite ver el detalle, editar el estado (activo/inactivo) o cambiar datos de una cuenta específica."""
    queryset = Cuenta.objects.all()
    serializer_class = CuentaSerializer
    permission_classes = [EsAdministradorGlobal]

    def perform_update(self, serializer):
        es_activo = serializer.validated_data.get("es_activo")
        if es_activo is False:
            cuenta = self.get_object()
            puede, msg = CuentaService.puede_desactivar(cuenta)
            if not puede:
                raise ValidationError({"es_activo": msg})
        serializer.save()

    def perform_destroy(self, instance):
        puede, msg = CuentaService.puede_eliminar(instance)
        if not puede:
            raise ValidationError({"detail": msg})
        instance.delete()