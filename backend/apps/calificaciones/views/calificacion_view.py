from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.serializers.calificacion_serializer import CalificacionSerializer
from apps.calificaciones.serializers.calificacion_historico_serializer import CalificacionHistoricoSerializer
from apps.calificaciones.permissions import EsDocenteOAutoridad, EsPropietarioCalificacion
from apps.calificaciones.services.calificacion_service import CalificacionService


class CalificacionListCreateView(generics.ListCreateAPIView):
    queryset = Calificacion.objects.select_related(
        'asignatura_evaluacion',
        'matricula__estudiante',
        'promedio_categoria',
    )
    serializer_class = CalificacionSerializer
    permission_classes = [EsDocenteOAutoridad]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['asignatura_evaluacion', 'matricula', 'promedio_categoria']
    search_fields = ['matricula__estudiante__nombres', 'matricula__estudiante__apellidos']

    def perform_create(self, serializer):
        service = CalificacionService()
        instance = serializer.save()
        service.calcular_estado_final(instance.valor)


class CalificacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Calificacion.objects.select_related(
        'asignatura_evaluacion',
        'matricula__estudiante',
        'promedio_categoria',
    )
    serializer_class = CalificacionSerializer
    permission_classes = [EsDocenteOAutoridad | EsPropietarioCalificacion]

    def perform_update(self, serializer):
        service = CalificacionService()
        old = self.get_object()
        instance = serializer.save()
        if old.valor != instance.valor:
            service._guardar_historico(old, instance.valor)


class CalificacionHistoricoListView(generics.ListAPIView):
    serializer_class = CalificacionHistoricoSerializer
    permission_classes = [EsDocenteOAutoridad | EsPropietarioCalificacion]

    def get_queryset(self):
        calificacion_id = self.kwargs.get('calificacion_pk')
        return Calificacion.objects.get(id=calificacion_id).historicos.all()
