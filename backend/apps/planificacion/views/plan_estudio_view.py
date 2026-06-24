from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura
from ..serializers.plan_estudio_serializer import PlanEstudioSerializer, GradoSerializer, AsignaturaSerializer


class PlanEstudioListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer


class PlanEstudioDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer


class GradoListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    institucion_lookup = 'planEstudio__institucion_id'

    def perform_create(self, serializer):
        auth = getattr(self.request, 'auth', None)
        if auth and auth.get('institucion_id') is not None:
            serializer.save(institucion_id=auth['institucion_id'])
        else:
            super().perform_create(serializer)


class GradoDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    institucion_lookup = 'planEstudio__institucion_id'


class AsignaturaListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'


class AsignaturaDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'