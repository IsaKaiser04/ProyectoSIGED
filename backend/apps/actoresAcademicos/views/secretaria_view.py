from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.administrativo import Secretaria
from apps.actoresAcademicos.serializers.administrativos_serializer import SecretariaSerializer
from apps.actoresAcademicos.models.permissions import EsAdministradorGlobal

class SecretariaListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Secretaria.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = SecretariaSerializer

class SecretariaDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Secretaria.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = SecretariaSerializer