from rest_framework import viewsets
from apps.ubicacion.models import Pais
from apps.ubicacion.serializers import PaisSerializer

class PaisViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para el catálogo de Países.
    Proporciona endpoints para LIST, CREATE, RETRIEVE, UPDATE y DELETE.
    """
    queryset = Pais.objects.all()
    serializer_class = PaisSerializer