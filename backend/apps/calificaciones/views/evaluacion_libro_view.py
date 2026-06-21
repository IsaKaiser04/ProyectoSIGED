from rest_framework import generics
from apps.calificaciones.models.evaluacionLibro import EvaluacionLibro
from apps.calificaciones.serializers.evaluacion_libro_serializer import EvaluacionLibroSerializer

class EvaluacionLibroListView(generics.ListCreateAPIView):
    queryset = EvaluacionLibro.objects.all()
    serializer_class = EvaluacionLibroSerializer

class EvaluacionLibroDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluacionLibro.objects.all()
    serializer_class = EvaluacionLibroSerializer