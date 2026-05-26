from rest_framework import generics
from ..models.destinatario import Destinatario
from ..serializers.destinatario_serializer import DestinatarioSerializer


class DestinatarioListCreateView(generics.ListCreateAPIView):
    queryset = Destinatario.objects.all()
    serializer_class = DestinatarioSerializer


class DestinatarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Destinatario.objects.all()
    serializer_class = DestinatarioSerializer