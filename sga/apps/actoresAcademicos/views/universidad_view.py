from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.institucion.models import Universidad
from apps.institucion.serializers import UniversidadSerializer

class UniversidadListCreateView(ListCreateAPIView):
    queryset = Universidad.objects.all()
    serializer_class = UniversidadSerializer

class UniversidadDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Universidad.objects.all()
    serializer_class = UniversidadSerializer