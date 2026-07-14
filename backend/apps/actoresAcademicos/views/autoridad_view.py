from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.administrativo import Autoridad
from apps.actoresAcademicos.serializers.administrativos_serializer import AutoridadSerializer
from apps.actoresAcademicos.models.permissions import EsAdministradorGlobal

class AutoridadListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Autoridad.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = AutoridadSerializer

class AutoridadDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Autoridad.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = AutoridadSerializer