from rest_framework import generics
from apps.calificaciones.models.promedioCategoria import PromedioCategoria
from apps.calificaciones.serializers.promedio_categoria_serializer import PromedioCategoriaSerializer

class PromedioCategoriaListView(generics.ListCreateAPIView):
    queryset = PromedioCategoria.objects.all()
    serializer_class = PromedioCategoriaSerializer

class PromedioCategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PromedioCategoria.objects.all()
    serializer_class = PromedioCategoriaSerializer