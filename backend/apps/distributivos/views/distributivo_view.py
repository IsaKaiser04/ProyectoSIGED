from rest_framework import generics

from ..models import Distributivo
from ..serializers import DistributivoSerializer


class DistributivoListCreateView(generics.ListCreateAPIView):
    queryset = Distributivo.objects.all()
    serializer_class = DistributivoSerializer


class DistributivoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Distributivo.objects.all()
    serializer_class = DistributivoSerializer