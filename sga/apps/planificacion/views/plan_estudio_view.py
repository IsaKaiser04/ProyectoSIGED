from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import Asignatura, Grado, PlanEstudio
from ..serializers import AsignaturaSerializer, GradoSerializer, PlanEstudioSerializer


class PlanEstudioListCreateView(ListCreateAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer
    permission_classes = []


class PlanEstudioDetailView(RetrieveUpdateDestroyAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer
    permission_classes = []


class GradoListCreateView(ListCreateAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    permission_classes = []


class GradoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    permission_classes = []


class AsignaturaListCreateView(ListCreateAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    permission_classes = []


class AsignaturaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    permission_classes = []
