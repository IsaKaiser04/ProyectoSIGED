from rest_framework import generics

from ..models import Horario
from ..serializers import HorarioSerializer


class HorarioListCreateView(generics.ListCreateAPIView):
    queryset = Horario.objects.select_related(
        'distributivo',
        'distributivo__docente',
        'distributivo__anio_lectivo',
        'distributivo_asignatura',
        'distributivo_asignatura__asignatura_ofertada',
        'jornada_hora',
    ).all()
    serializer_class = HorarioSerializer


class HorarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Horario.objects.select_related(
        'distributivo',
        'distributivo__docente',
        'distributivo__anio_lectivo',
        'distributivo_asignatura',
        'distributivo_asignatura__asignatura_ofertada',
        'jornada_hora',
    ).all()
    serializer_class = HorarioSerializer
