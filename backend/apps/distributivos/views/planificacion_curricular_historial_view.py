from rest_framework import generics

from ..models import PlanificacionCurricularHistorial
from ..serializers import PlanificacionCurricularHistorialSerializer


class PlanificacionCurricularHistorialListCreateView(generics.ListCreateAPIView):
    queryset = PlanificacionCurricularHistorial.objects.select_related(
        'planificacion_curricular',
        'planificacion_curricular__distributivo_asignatura',
        'planificacion_curricular__distributivo_asignatura__asignatura_ofertada',
    ).all()
    serializer_class = PlanificacionCurricularHistorialSerializer


class PlanificacionCurricularHistorialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanificacionCurricularHistorial.objects.select_related(
        'planificacion_curricular',
        'planificacion_curricular__distributivo_asignatura',
        'planificacion_curricular__distributivo_asignatura__asignatura_ofertada',
    ).all()
    serializer_class = PlanificacionCurricularHistorialSerializer
