from rest_framework import generics
from apps.calificaciones.models.incidencia import Incidencia
from apps.calificaciones.serializers.incidencia_serializer import IncidenciaSerializer

class IncidenciaListView(generics.ListCreateAPIView):
    queryset = Incidencia.objects.all()
    serializer_class = IncidenciaSerializer

class IncidenciaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Incidencia.objects.all()
    serializer_class = IncidenciaSerializer