from rest_framework import generics
from apps.actoresAcademicos.models.administrativo import Secretaria
from apps.actoresAcademicos.serializers.administrativos_serializer import SecretariaSerializer

class SecretariaListCreateView(generics.ListCreateAPIView):
    queryset = Secretaria.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = SecretariaSerializer

class SecretariaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Secretaria.objects.select_related('cuenta', 'institucion', 'direccion_domicilio__parroquia__canton__provincia__pais').all()
    serializer_class = SecretariaSerializer