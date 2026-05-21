from rest_framework import viewsets
from .models import Distributivo
from .serializers import DistributivoSerializer


class DistributivoViewSet(viewsets.ModelViewSet):
    """ViewSet mínimo para CRUD de Distributivos.

    Solo implementa los endpoints básicos: create, list, retrieve, update, destroy.
    """
    queryset = Distributivo.objects.all()
    serializer_class = DistributivoSerializer

    # Mantener explícitamente únicamente los handlers CRUD básicos.
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)