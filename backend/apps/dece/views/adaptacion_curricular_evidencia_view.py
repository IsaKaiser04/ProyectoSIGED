from rest_framework import generics

from ..models import AdaptacionCurricularEvidencia
from ..serializers import AdaptacionCurricularEvidenciaSerializer


class AdaptacionCurricularEvidenciaListCreateView(generics.ListCreateAPIView):
    queryset = AdaptacionCurricularEvidencia.objects.select_related('adaptacion_curricular', 'adaptacion_curricular__matricula').all()
    serializer_class = AdaptacionCurricularEvidenciaSerializer


class AdaptacionCurricularEvidenciaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AdaptacionCurricularEvidencia.objects.select_related('adaptacion_curricular', 'adaptacion_curricular__matricula').all()
    serializer_class = AdaptacionCurricularEvidenciaSerializer
