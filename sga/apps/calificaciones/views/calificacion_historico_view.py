from rest_framework import generics
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.serializers.calificacion_historico_serializer import CalificacionHistoricoSerializer

class CalificacionHistoricoListView(generics.ListCreateAPIView):
    queryset = CalificacionHistorico.objects.all()
    serializer_class = CalificacionHistoricoSerializer

class CalificacionHistoricoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CalificacionHistorico.objects.all()
    serializer_class = CalificacionHistoricoSerializer