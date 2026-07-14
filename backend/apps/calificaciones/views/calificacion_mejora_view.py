from rest_framework import generics

from apps.calificaciones.models.calificacionMejora import CalificacionMejora
from apps.calificaciones.serializers.calificacion_mejora_serializer import CalificacionMejoraSerializer
from apps.calificaciones.permissions import EsDocenteOAutoridad


class CalificacionMejoraListCreateView(generics.ListCreateAPIView):
    serializer_class = CalificacionMejoraSerializer
    permission_classes = [EsDocenteOAutoridad]

    def get_queryset(self):
        calificacion_id = self.kwargs.get('calificacion_pk')
        return CalificacionMejora.objects.filter(calificacion_id=calificacion_id)

    def perform_create(self, serializer):
        calificacion_id = self.kwargs.get('calificacion_pk')
        serializer.save(calificacion_id=calificacion_id)


class CalificacionMejoraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CalificacionMejora.objects.all()
    serializer_class = CalificacionMejoraSerializer
    permission_classes = [EsDocenteOAutoridad]
