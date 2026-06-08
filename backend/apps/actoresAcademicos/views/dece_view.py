from rest_framework import generics
from apps.actoresAcademicos.models.administrativo import Dece
from apps.actoresAcademicos.serializers.administrativos_serializer import DeceSerializer

class DeceListCreateView(generics.ListCreateAPIView):
    queryset = Dece.objects.all()
    serializer_class = DeceSerializer

class DeceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Dece.objects.all()
    serializer_class = DeceSerializer