from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.serializers.promedio_serializer import PromedioSerializer
from apps.calificaciones.serializers.promedio_categoria_serializer import PromedioCategoriaSerializer
from apps.calificaciones.permissions import EsDocenteOAutoridad, EsPropietarioCalificacion


class PromedioListCreateView(generics.ListCreateAPIView):
    queryset = Promedio.objects.select_related(
        'matricula__estudiante',
        'distributivo_asignatura__asignatura_ofertada',
        'periodo_academico',
    )
    serializer_class = PromedioSerializer
    permission_classes = [EsDocenteOAutoridad]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['matricula', 'distributivo_asignatura', 'periodo_academico']


class PromedioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Promedio.objects.select_related(
        'matricula__estudiante',
        'distributivo_asignatura__asignatura_ofertada',
        'periodo_academico',
    )
    serializer_class = PromedioSerializer
    permission_classes = [EsDocenteOAutoridad | EsPropietarioCalificacion]


class PromedioCategoriaListView(generics.ListAPIView):
    serializer_class = PromedioCategoriaSerializer
    permission_classes = [EsDocenteOAutoridad | EsPropietarioCalificacion]

    def get_queryset(self):
        promedio_id = self.kwargs.get('promedio_pk')
        return Promedio.objects.get(id=promedio_id).promedios_categoria.select_related(
            'evaluacion_categoria',
        )
