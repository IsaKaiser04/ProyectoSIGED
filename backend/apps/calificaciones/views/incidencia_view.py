from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from apps.calificaciones.models.Incidencia import Incidencia
from apps.calificaciones.serializers.incidencia_serializer import IncidenciaSerializer
from apps.calificaciones.permissions import EsDocenteOAutoridad


class IncidenciaListCreateView(generics.ListCreateAPIView):
    queryset = Incidencia.objects.prefetch_related('calificaciones')
    serializer_class = IncidenciaSerializer
    permission_classes = [EsDocenteOAutoridad]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['tipo', 'notificar']


class IncidenciaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Incidencia.objects.prefetch_related('calificaciones')
    serializer_class = IncidenciaSerializer
    permission_classes = [EsDocenteOAutoridad]
