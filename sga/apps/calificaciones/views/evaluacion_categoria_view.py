from rest_framework import generics
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.serializers.evaluacion_categoria_serializer import EvaluacionCategoriaSerializer


class EvaluacionCategoriaListCreateView(generics.ListCreateAPIView):
    queryset = EvaluacionCategoria.objects.prefetch_related('subcategorias')
    serializer_class = EvaluacionCategoriaSerializer

class EvaluacionCategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluacionCategoria.objects.prefetch_related('subcategorias')
    serializer_class = EvaluacionCategoriaSerializer
