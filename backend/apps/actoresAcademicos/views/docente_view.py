from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.serializers.docente_serializer import DocenteSerializer
from apps.actoresAcademicos.models.permissions import EsAdminGlobalOAutoridad

class DocenteListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()
    serializer_class = DocenteSerializer
    permission_classes = [EsAdminGlobalOAutoridad]

class DocenteDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()
    serializer_class = DocenteSerializer