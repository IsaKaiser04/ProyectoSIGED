from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.serializers.asignatura_evaluacion_serializer import AsignaturaEvaluacionSerializer
from apps.calificaciones.permissions import EsDocenteOAutoridad


class AsignaturaEvaluacionListCreateView(generics.ListCreateAPIView):
    queryset = AsignaturaEvaluacion.objects.select_related(
        'distributivo_asignatura__asignatura_ofertada',
        'periodo_academico',
    )
    serializer_class = AsignaturaEvaluacionSerializer
    permission_classes = [EsDocenteOAutoridad]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['distributivo_asignatura', 'periodo_academico', 'activo']


class AsignaturaEvaluacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AsignaturaEvaluacion.objects.select_related(
        'distributivo_asignatura__asignatura_ofertada',
        'periodo_academico',
    )
    serializer_class = AsignaturaEvaluacionSerializer
    permission_classes = [EsDocenteOAutoridad]
