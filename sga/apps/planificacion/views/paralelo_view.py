from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import Paralelo
from ..serializers import ParaleloSerializer


class ParaleloListCreateView(ListCreateAPIView):
    queryset = Paralelo.objects.all()
    serializer_class = ParaleloSerializer
    permission_classes = []


class ParaleloDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Paralelo.objects.all()
    serializer_class = ParaleloSerializer
    permission_classes = []
