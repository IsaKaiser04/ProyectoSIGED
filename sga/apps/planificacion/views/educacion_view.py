from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import EducacionNivel, EducacionSubNivel
from ..serializers import EducacionNivelSerializer, EducacionSubNivelSerializer


class EducacionNivelListCreateView(ListCreateAPIView):
    queryset = EducacionNivel.objects.all()
    serializer_class = EducacionNivelSerializer
    permission_classes = []


class EducacionNivelDetailView(RetrieveUpdateDestroyAPIView):
    queryset = EducacionNivel.objects.all()
    serializer_class = EducacionNivelSerializer
    permission_classes = []


class EducacionSubNivelListCreateView(ListCreateAPIView):
    queryset = EducacionSubNivel.objects.all()
    serializer_class = EducacionSubNivelSerializer
    permission_classes = []


class EducacionSubNivelDetailView(RetrieveUpdateDestroyAPIView):
    queryset = EducacionSubNivel.objects.all()
    serializer_class = EducacionSubNivelSerializer
    permission_classes = []
