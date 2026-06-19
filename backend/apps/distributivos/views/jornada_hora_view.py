from rest_framework import filters, generics

from ..models import JornadaHora
from ..serializers import JornadaHoraSerializer


class JornadaHoraListCreateView(generics.ListCreateAPIView):
    queryset = JornadaHora.objects.all()
    serializer_class = JornadaHoraSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'institucion_educativa_referencia']


class JornadaHoraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JornadaHora.objects.all()
    serializer_class = JornadaHoraSerializer