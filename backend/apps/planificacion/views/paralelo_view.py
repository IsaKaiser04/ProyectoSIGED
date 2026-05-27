from rest_framework import generics
from ..models.paralelo import Paralelo
from ..serializers.paralelo_serializer import ParaleloSerializer


class ParaleloListCreateView(generics.ListCreateAPIView):
    queryset = Paralelo.objects.all()
    serializer_class = ParaleloSerializer


class ParaleloDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paralelo.objects.all()
    serializer_class = ParaleloSerializer