from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.actoresAcademicos.serializers.estudiante_serializer import EstudianteSerializer
from apps.actoresAcademicos.models.permissions import EsAdminGlobalOAutoridad

class EstudianteListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):

    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()
    serializer_class = EstudianteSerializer
    permission_classes = [EsAdminGlobalOAutoridad]

class EstudianteDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [EsAdminGlobalOAutoridad]
    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = EstudianteSerializer
    