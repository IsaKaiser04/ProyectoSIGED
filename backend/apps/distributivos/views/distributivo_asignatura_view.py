from rest_framework import generics

from ..models import DistributivoAsignatura
from ..serializers import DistributivoAsignaturaSerializer


class DistributivoAsignaturaListCreateView(generics.ListCreateAPIView):
    queryset = DistributivoAsignatura.objects.select_related('distributivo').all()
    serializer_class = DistributivoAsignaturaSerializer


class DistributivoAsignaturaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DistributivoAsignatura.objects.select_related('distributivo').all()
    serializer_class = DistributivoAsignaturaSerializer