from rest_framework import filters, generics

from ..models import JornadaHora
from ..serializers import JornadaHoraSerializer


class JornadaHoraListCreateView(generics.ListCreateAPIView):
    queryset = JornadaHora.objects.select_related('institucion').all()
    serializer_class = JornadaHoraSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'institucion__nombre']


class JornadaHoraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JornadaHora.objects.select_related('institucion').all()
    serializer_class = JornadaHoraSerializer
