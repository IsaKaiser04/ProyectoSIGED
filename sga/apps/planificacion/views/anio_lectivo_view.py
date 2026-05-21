from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import AnioLectivo, PeriodoAcademico
from ..serializers import AnioLectivoSerializer, PeriodoAcademicoSerializer


class AnioLectivoListCreateView(ListCreateAPIView):
    queryset = AnioLectivo.objects.all()
    serializer_class = AnioLectivoSerializer
    permission_classes = []


class AnioLectivoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = AnioLectivo.objects.all()
    serializer_class = AnioLectivoSerializer
    permission_classes = []


class PeriodoAcademicoListCreateView(ListCreateAPIView):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer
    permission_classes = []


class PeriodoAcademicoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer
    permission_classes = []
