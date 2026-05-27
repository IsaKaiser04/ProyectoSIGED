from rest_framework import viewsets
from apps.ubicacion.models import Direccion
from apps.ubicacion.serializers import DireccionSerializer

class DireccionViewSet(viewsets.ModelViewSet):
    """
    Controlador para las Direcciones físicas de los actores del sistema.
    """
    queryset = Direccion.objects.select_related(
        'parroquia__canton__provincia__pais'
    ).all()
    serializer_class = DireccionSerializer