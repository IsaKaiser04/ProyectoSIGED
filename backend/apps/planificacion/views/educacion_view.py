from rest_framework import generics
from rest_framework.response import Response
from ..models.educacion import EducacionNivel, EducacionSubNivel
from ..models.enums import NivelEducativo
from ..serializers.educacion_serializer import EducacionNivelSerializer, EducacionSubNivelSerializer


class NivelEducativoListView(generics.GenericAPIView):
    def get(self, request):
        niveles = [
            {'value': e.value, 'nombre': e.value, 'codigo': e.name}
            for e in NivelEducativo
        ]
        return Response(niveles)


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