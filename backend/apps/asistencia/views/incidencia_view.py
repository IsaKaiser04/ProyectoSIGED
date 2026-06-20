from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.asistencia.services.incidencia_service import IncidenciaService


class IncidenciaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Listar incidencias. Se puede filtrar por matricula_id, tipo, estado."""
        matricula_id = request.query_params.get('matricula_id')
        tipo = request.query_params.get('tipo')

        if matricula_id:
            return Response(IncidenciaService.por_matricula(int(matricula_id)))
        if tipo:
            from apps.asistencia.repositories.incidencia_repository import IncidenciaRepository
            instances = IncidenciaRepository.get_by_tipo(tipo)
            from apps.asistencia.serializers.incidencia_serializer import IncidenciaListSerializer
            return Response(IncidenciaListSerializer(instances, many=True).data)

        return Response(IncidenciaService.list_all())

    def retrieve(self, request, pk=None):
        data = IncidenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        """Crear incidencia (docente o secretaría)."""
        # Preparar datos para el servicio
        data = request.data.copy()

        # Convertir IDs a objetos si vienen como strings
        if 'asistencia' in data and data['asistencia']:
            from apps.asistencia.repositories.asistencia_repository import AsistenciaRepository
            asistencia = AsistenciaRepository.get_by_id(int(data['asistencia']))
            if not asistencia:
                return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_400_BAD_REQUEST)
            data['asistencia'] = asistencia

        data_result, errors = IncidenciaService.create(data, request.user)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data_result, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Actualizar incidencia (cambiar estado, agregar detalle)."""
        data, errors = IncidenciaService.update(pk, request.data, request.user)
        if not data and not errors:
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        # TODO: Solo admin
        if not IncidenciaService.delete(pk):
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """GET /api/asistencia/incidencias/pendientes/
        
        Incidencias en estado REGISTRADA pendientes de resolución.
        Para DECE o Autoridad Académica.
        """
        return Response(IncidenciaService.get_pendientes())

    @action(detail=False, methods=['get'])
    def por_asistencia(self, request):
        """GET /api/asistencia/incidencias/por_asistencia/?asistencia_id=1"""
        asistencia_id = request.query_params.get('asistencia_id')
        if not asistencia_id:
            return Response({'error': 'Parámetro asistencia_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(IncidenciaService.por_asistencia(int(asistencia_id)))

    @action(detail=False, methods=['get'])
    def por_periodo(self, request):
        """GET /api/asistencia/incidencias/por_periodo/?matricula_id=1&fecha_inicio=2025-01-01&fecha_fin=2025-03-31"""
        matricula_id = request.query_params.get('matricula_id')
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if not all([matricula_id, fecha_inicio, fecha_fin]):
            return Response(
                {'error': 'Parámetros requeridos: matricula_id, fecha_inicio, fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(IncidenciaService.por_periodo(
            int(matricula_id), fecha_inicio, fecha_fin
        ))
