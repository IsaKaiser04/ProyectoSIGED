from rest_framework import viewsets
from apps.ubicacion.models import Parroquia
from apps.ubicacion.serializers import ParroquiaSerializer

class ParroquiaViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para la gestión de Parroquias territoriales.
    """
    queryset = Parroquia.objects.all()
    serializer_class = ParroquiaSerializer