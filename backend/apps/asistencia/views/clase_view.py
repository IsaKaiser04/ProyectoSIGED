from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.asistencia.services.clase_service import ClaseService


class ClaseViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Listar clases. Se puede filtrar por distributivo_id o estado."""
        distributivo_id = request.query_params.get('distributivo_id')
        estado = request.query_params.get('estado')

        if distributivo_id:
            return Response(ClaseService.por_distributivo(int(distributivo_id)))
        if estado:
            return Response(ClaseService.por_estado(estado))
        return Response(ClaseService.list_all())

    def retrieve(self, request, pk=None):
        """Detalle de clase con sus asistencias."""
        data = ClaseService.retrieve(pk)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        """Crear una nueva clase."""
        # TODO: Validar permisos de docente o admin
        data, errors = ClaseService.create(request.data, request.user)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Actualizar datos de una clase."""
        data, errors = ClaseService.update(pk, request.data, request.user)
        if not data and not errors:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        if not ClaseService.delete(pk):
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        """POST /api/asistencia/clases/{id}/iniciar/
        
        Cambia estado a EN_CURSO. El docente inicia la clase antes de tomar asistencia.
        """
        data, errors = ClaseService.iniciar(pk)
        if not data and not errors:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """POST /api/asistencia/clases/{id}/finalizar/"""
        data, errors = ClaseService.finalizar(pk)
        if not data and not errors:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """POST /api/asistencia/clases/{id}/cancelar/"""
        data, errors = ClaseService.cancelar(pk)
        if not data and not errors:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_distributivo(self, request):
        """GET /api/asistencia/clases/por_distributivo/?distributivo_id=1"""
        distributivo_id = request.query_params.get('distributivo_id')
        if not distributivo_id:
            return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ClaseService.por_distributivo(int(distributivo_id)))

    @action(detail=False, methods=['get'])
    def semana(self, request):
        """GET /api/asistencia/clases/semana/?distributivo_id=1&fecha=2025-01-15
        
        Retorna las clases de la semana que contiene la fecha dada.
        Es el endpoint principal para la cuadrícula semanal del docente.
        """
        from datetime import datetime

        distributivo_id = request.query_params.get('distributivo_id')
        fecha_str = request.query_params.get('fecha')

        if not distributivo_id:
            return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date() if fecha_str else None
        return Response(ClaseService.get_semana(int(distributivo_id), fecha))

    @action(detail=True, methods=['get'])
    def asistencias(self, request, pk=None):
        """GET /api/asistencia/clases/{id}/asistencias/
        
        Obtiene la clase con todas sus asistencias.
        Es el endpoint para cargar la cuadrícula al abrir una clase.
        """
        data = ClaseService.get_asistencias(pk)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)
