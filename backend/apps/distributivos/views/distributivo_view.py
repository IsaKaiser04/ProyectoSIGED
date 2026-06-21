from rest_framework import generics

from ..models import Distributivo
from ..serializers import DistributivoSerializer


class DistributivoListCreateView(generics.ListCreateAPIView):
    queryset = Distributivo.objects.select_related('docente', 'anio_lectivo').all()
    serializer_class = DistributivoSerializer


class DistributivoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Distributivo.objects.select_related('docente', 'anio_lectivo').all()
    serializer_class = DistributivoSerializer
