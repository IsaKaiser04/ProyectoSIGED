from rest_framework import viewsets
from apps.ubicacion.models.pais import Pais
from apps.ubicacion.serializers.pais_serializer import PaisSerializer

class PaisViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para el catálogo de Países.
    Proporciona endpoints para LIST, CREATE, RETRIEVE, UPDATE y DELETE.
    """
    serializer_class = PaisSerializer

    def get_queryset(self):
        queryset = Pais.objects.all().order_by('nombre')
        buscar = self.request.query_params.get('buscar', None)
        if buscar:
            queryset = queryset.filter(nombre__icontains=buscar)
        return queryset