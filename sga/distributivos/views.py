from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Distributivo
from .serializers import DistributivoSerializer
from .services import DistributivoService


class DistributivoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD de Distributivos
    
    GET /api/distributivos/ - Listar todos
    POST /api/distributivos/ - Crear
    GET /api/distributivos/{id}/ - Obtener
    PUT /api/distributivos/{id}/ - Actualizar
    DELETE /api/distributivos/{id}/ - Eliminar
    GET /api/distributivos/por-docente/{docente}/ - Filtrar por docente
    """
    queryset = Distributivo.objects.all()
    serializer_class = DistributivoSerializer
    
    # Filtros y búsqueda
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['docente', 'materia', 'paralelo', 'horario']
    search_fields = ['docente', 'materia', 'horario']
    ordering_fields = ['created_at', 'horas', 'docente']
    ordering = ['-created_at']

    def get_success_response(self, data=None, message="", status_code=status.HTTP_200_OK):
        """
        Método helper para estandarizar todas las respuestas.
        Asegura que TODAS las respuestas sigan el formato:
        {
            "success": true,
            "message": "",
            "data": null
        }
        """
        return Response(
            {
                'success': True,
                'message': message,
                'data': data
            },
            status=status_code
        )

    def get_error_response(self, message="", data=None, status_code=status.HTTP_400_BAD_REQUEST):
        """
        Método helper para respuestas de error con el formato estandarizado.
        """
        return Response(
            {
                'success': False,
                'message': message,
                'data': data
            },
            status=status_code
        )

    def create(self, request, *args, **kwargs):
        """Crear un nuevo distributivo"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        distributivo = serializer.save()
        output_serializer = self.get_serializer(distributivo)
        
        return self.get_success_response(
            data=output_serializer.data,
            message='Distributivo creado correctamente',
            status_code=status.HTTP_201_CREATED
        )

    def list(self, request, *args, **kwargs):
        """Listar todos los distributivos con soporte para paginación"""
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_success_response(
                data=serializer.data,
                message='Listado de distributivos'
            )

        serializer = self.get_serializer(queryset, many=True)

        return self.get_success_response(
            data=serializer.data,
            message='Listado de distributivos'
        )

    def retrieve(self, request, *args, **kwargs):
        """Obtener un distributivo por ID"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        return self.get_success_response(
            data=serializer.data,
            message='Distributivo encontrado'
        )

    def update(self, request, *args, **kwargs):
        """Actualizar un distributivo (PUT)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return self.get_success_response(
            data=serializer.data,
            message='Distributivo actualizado correctamente'
        )

    def destroy(self, request, *args, **kwargs):
        """Eliminar un distributivo"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return self.get_success_response(
            data=None,
            message='Distributivo eliminado correctamente',
            status_code=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'], url_path='por-docente/(?P<docente>[^/.]+)')
    def por_docente(self, request, docente=None):
        """Obtener distributivos de un docente específico"""
        if not docente:
            return self.get_error_response(
                message='El parámetro docente es requerido',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        distributivos = Distributivo.objects.filter(docente__icontains=docente)
        serializer = self.get_serializer(distributivos, many=True)
        
        return self.get_success_response(
            data=serializer.data,
            message=f'Distributivos del docente {docente}'
        )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtener estadísticas del módulo"""
        from django.db.models import Sum, Count, Avg
        
        stats = Distributivo.objects.aggregate(
            total_distributivos=Count('id'),
            total_horas=Sum('horas'),
            promedio_horas=Avg('horas'),
            total_docentes=Count('docente', distinct=True),
            total_materias=Count('materia', distinct=True)
        )
        
        return self.get_success_response(
            data=stats,
            message='Estadísticas de distributivos'
        )