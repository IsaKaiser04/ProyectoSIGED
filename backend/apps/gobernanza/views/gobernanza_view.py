from rest_framework import generics
from ..models.gobernanza import Gobernanza
from ..serializers.gobernanza_serializer import GobernanzaSerializer


class GobernanzaListCreateView(generics.ListCreateAPIView):
    
    queryset = Gobernanza.objects.all()
    serializer_class = GobernanzaSerializer


class GobernanzaDetailView(generics.RetrieveUpdateDestroyAPIView):
    
    queryset = Gobernanza.objects.all()
    serializer_class = GobernanzaSerializer