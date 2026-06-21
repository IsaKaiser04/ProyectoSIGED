from rest_framework import generics
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.serializers.evaluacion_equivalencia_serializer import EvaluacionEquivalenciaSerializer

class EvaluacionEquivalenciaListView(generics.ListCreateAPIView):
    queryset = EvaluacionEquivalencia.objects.all()
    serializer_class = EvaluacionEquivalenciaSerializer

class EvaluacionEquivalenciaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluacionEquivalencia.objects.all()
    serializer_class = EvaluacionEquivalenciaSerializer