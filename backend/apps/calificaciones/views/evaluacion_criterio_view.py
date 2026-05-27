from rest_framework import generics
from apps.calificaciones.models.evaluacionCriterio import EvaluacionCriterio
from apps.calificaciones.serializers.evaluacion_criterio_serializer import EvaluacionCriterioSerializer

class EvaluacionCriterioListView(generics.ListCreateAPIView):
    queryset = EvaluacionCriterio.objects.all()
    serializer_class = EvaluacionCriterioSerializer

class EvaluacionCriterioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluacionCriterio.objects.all()
    serializer_class = EvaluacionCriterioSerializer
    