from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.administrativo import Dece
from apps.actoresAcademicos.serializers.administrativos_serializer import DeceSerializer
from apps.actoresAcademicos.models.permissions import EsAdministradorGlobal

class DeceListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Dece.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = DeceSerializer

class DeceDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EsAdministradorGlobal]
    queryset = Dece.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = DeceSerializer