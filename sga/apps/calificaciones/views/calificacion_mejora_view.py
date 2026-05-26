from rest_framework import generics
from apps.calificaciones.models.calificacionMejora import CalificacionMejora
from apps.calificaciones.serializers.calificacion_mejora_serializer import CalificacionMejoraSerializer

class CalificacionMejoraListView(generics.ListCreateAPIView):
    queryset = CalificacionMejora.objects.all()
    serializer_class = CalificacionMejoraSerializer

class CalificacionMejoraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CalificacionMejora.objects.all()
    serializer_class = CalificacionMejoraSerializer