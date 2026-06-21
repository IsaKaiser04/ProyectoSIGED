from rest_framework import generics

from ..models import AdaptacionCurricular
from ..serializers import AdaptacionCurricularSerializer


class AdaptacionCurricularListCreateView(generics.ListCreateAPIView):
    queryset = AdaptacionCurricular.objects.select_related('matricula').all()
    serializer_class = AdaptacionCurricularSerializer


class AdaptacionCurricularDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AdaptacionCurricular.objects.select_related('matricula').all()
    serializer_class = AdaptacionCurricularSerializer
