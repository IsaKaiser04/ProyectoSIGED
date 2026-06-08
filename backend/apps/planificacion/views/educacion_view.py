from rest_framework import generics
from ..models.educacion import EducacionNivel, EducacionSubNivel
from ..serializers.educacion_serializer import EducacionNivelSerializer, EducacionSubNivelSerializer


class EducacionNivelListCreateView(generics.ListCreateAPIView):
    queryset = EducacionNivel.objects.all()
    serializer_class = EducacionNivelSerializer


class EducacionNivelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EducacionNivel.objects.all()
    serializer_class = EducacionNivelSerializer


class EducacionSubNivelListCreateView(generics.ListCreateAPIView):
    queryset = EducacionSubNivel.objects.all()
    serializer_class = EducacionSubNivelSerializer


class EducacionSubNivelDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EducacionSubNivel.objects.all()
    serializer_class = EducacionSubNivelSerializer