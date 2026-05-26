from rest_framework import generics
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.serializers.calificacion_serializer import CalificacionSerializer

class CalificacionListCreateView(generics.ListCreateAPIView):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer

class CalificacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer