from rest_framework import viewsets
from apps.ubicacion.models import Canton
from apps.ubicacion.serializers import CantonSerializer

class CantonViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para la gestión de Cantones.
    """
    queryset = Canton.objects.all()
    serializer_class = CantonSerializer