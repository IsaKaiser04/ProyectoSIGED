from rest_framework import generics

from ..models import PlanificacionCurricular
from ..serializers import PlanificacionCurricularSerializer


class PlanificacionCurricularListCreateView(generics.ListCreateAPIView):
    queryset = PlanificacionCurricular.objects.select_related('distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada').all()
    serializer_class = PlanificacionCurricularSerializer


class PlanificacionCurricularDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanificacionCurricular.objects.select_related('distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada').all()
    serializer_class = PlanificacionCurricularSerializer
