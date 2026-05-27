from rest_framework import viewsets
from apps.ubicacion.models import Provincia
from apps.ubicacion.serializers import ProvinciaSerializer

class ProvinciaViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para las Provincias vinculadas a un país.
    """
    queryset = Provincia.objects.all()
    serializer_class = ProvinciaSerializer