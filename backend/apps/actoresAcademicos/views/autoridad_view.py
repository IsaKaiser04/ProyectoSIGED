from rest_framework import generics
from apps.actoresAcademicos.models.administrativo import Autoridad
from apps.actoresAcademicos.serializers.administrativos_serializer import AutoridadSerializer

class AutoridadListCreateView(generics.ListCreateAPIView):
    queryset = Autoridad.objects.all()
    serializer_class = AutoridadSerializer

class AutoridadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Autoridad.objects.all()
    serializer_class = AutoridadSerializer