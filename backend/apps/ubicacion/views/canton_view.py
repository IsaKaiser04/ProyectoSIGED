from rest_framework import viewsets
from apps.ubicacion.models import Canton
from apps.ubicacion.serializers import CantonSerializer

class CantonViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para la gestión de Cantones.
    """
    serializer_class = CantonSerializer
    def get_queryset(self):
        queryset = Canton.objects.all().order_by('nombre')
        
        # Filtros de búsqueda dinámicos
        buscar = self.request.query_params.get('buscar', None)
        provincia_id = self.request.query_params.get('provincia_id', None)
        pais_id = self.request.query_params.get('pais_id', None)
        if buscar:
            queryset = queryset.filter(nombre__icontains=buscar)
        if provincia_id:
            queryset = queryset.filter(provincia_id=provincia_id)
        if pais_id:
            queryset = queryset.filter(provincia__pais_id=pais_id)
            
        return queryset