from rest_framework import generics

from ..models import AdaptacionCurricularPlanificacion
from ..serializers import AdaptacionCurricularPlanificacionSerializer


class AdaptacionCurricularPlanificacionListCreateView(generics.ListCreateAPIView):
    queryset = AdaptacionCurricularPlanificacion.objects.select_related('adaptacion_curricular').all()
    serializer_class = AdaptacionCurricularPlanificacionSerializer


class AdaptacionCurricularPlanificacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AdaptacionCurricularPlanificacion.objects.select_related('adaptacion_curricular').all()
    serializer_class = AdaptacionCurricularPlanificacionSerializer