from rest_framework import viewsets
from apps.ubicacion.models.provincia import Provincia
from apps.ubicacion.serializers.provincia_serializer import ProvinciaSerializer

class ProvinciaViewSet(viewsets.ModelViewSet):
    """
    Controlador automático para el catálogo de Provincias.
    Maneja listado, creación, actualización y eliminación de registros.
    """
    serializer_class = ProvinciaSerializer

    def get_queryset(self):
        queryset = Provincia.objects.all().order_by('nombre')
        
        # Filtros de búsqueda dinámicos
        buscar = self.request.query_params.get('buscar', None)
        pais_id = self.request.query_params.get('pais_id', None)
        
        if buscar:
            queryset = queryset.filter(nombre__icontains=buscar)
        if pais_id:
            queryset = queryset.filter(pais_id=pais_id)
            
        return queryset