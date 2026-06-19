from rest_framework import generics
from ..models.anio_lectivo import AnioLectivo, PeriodoAcademico
from ..serializers.anio_lectivo_serializer import AnioLectivoSerializer, PeriodoAcademicoSerializer


class AnioLectivoListCreateView(generics.ListCreateAPIView):
    queryset = AnioLectivo.objects.all()
    serializer_class = AnioLectivoSerializer


class AnioLectivoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnioLectivo.objects.all()
    serializer_class = AnioLectivoSerializer


class PeriodoAcademicoListCreateView(generics.ListCreateAPIView):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer


class PeriodoAcademicoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer