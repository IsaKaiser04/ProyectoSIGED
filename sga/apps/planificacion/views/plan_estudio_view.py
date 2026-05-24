from rest_framework import generics
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura
from ..serializers.plan_estudio_serializer import PlanEstudioSerializer, GradoSerializer, AsignaturaSerializer


class PlanEstudioListCreateView(generics.ListCreateAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer


class PlanEstudioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer


class GradoListCreateView(generics.ListCreateAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class GradoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class AsignaturaListCreateView(generics.ListCreateAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer


class AsignaturaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer