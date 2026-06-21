from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.actoresAcademicos.models.universidad import Universidad
from apps.actoresAcademicos.serializers.universidad_serializer import UniversidadSerializer

class UniversidadListCreateView(ListCreateAPIView):
    queryset = Universidad.objects.all()
    serializer_class = UniversidadSerializer

class UniversidadDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Universidad.objects.all()
    serializer_class = UniversidadSerializer