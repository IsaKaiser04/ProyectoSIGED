from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import Calificacion
from ..serializers import CalificacionSerializer


class CalificacionListCreateView(ListCreateAPIView):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer
    permission_classes = []


class CalificacionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer
    permission_classes = []
