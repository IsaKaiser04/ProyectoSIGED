from rest_framework import generics
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.serializers.promedio_serializer import PromedioSerializer

class PromedioListView(generics.ListCreateAPIView):
    queryset = Promedio.objects.all()
    serializer_class = PromedioSerializer

class PromedioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Promedio.objects.all()
    serializer_class = PromedioSerializer