from rest_framework import generics
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.serializers.evaluacion_rubrica_serializer import EvaluacionRubricaSerializer

class EvaluacionRubricaListView(generics.ListCreateAPIView):
    queryset = EvaluacionRubrica.objects.all()
    serializer_class = EvaluacionRubricaSerializer

class EvaluacionRubricaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluacionRubrica.objects.all()
    serializer_class = EvaluacionRubricaSerializer