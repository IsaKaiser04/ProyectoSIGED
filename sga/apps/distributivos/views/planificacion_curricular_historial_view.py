from rest_framework import generics

from ..models import PlanificacionCurricularHistorial
from ..serializers import PlanificacionCurricularHistorialSerializer


class PlanificacionCurricularHistorialListCreateView(generics.ListCreateAPIView):
    queryset = PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').all()
    serializer_class = PlanificacionCurricularHistorialSerializer


class PlanificacionCurricularHistorialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').all()
    serializer_class = PlanificacionCurricularHistorialSerializer