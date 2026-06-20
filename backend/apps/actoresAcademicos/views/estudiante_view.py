from rest_framework import generics
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.actoresAcademicos.serializers.estudiante_serializer import EstudianteSerializer


class EstudianteListCreateView(generics.ListCreateAPIView):

    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = EstudianteSerializer

class EstudianteDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Estudiante.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = EstudianteSerializer
    