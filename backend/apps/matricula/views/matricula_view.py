from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.matricula_service import MatriculaService
from apps.matricula.models import Matricula, MatriculaEstado


class MatriculaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(MatriculaService.list_all())

    def retrieve(self, request, pk=None):
        data = MatriculaService.retrieve(pk)
        if not data:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = MatriculaService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        data, errors = MatriculaService.update(pk, request.data)
        if not data and not errors:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = MatriculaService.anular(pk, "Eliminado via API")
        if not success:
            return Response(errors, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def legalizar(self, request, pk=None):
        data, errors = MatriculaService.legalizar(pk, request.data, request.user.id)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        motivo = request.data.get('motivo', 'Sin motivo especificado')
        success, errors = MatriculaService.anular(pk, motivo)
        if not success:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'mensaje': 'Matricula anulada y cupo liberado correctamente'})

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        data, errors = MatriculaService.update(pk, {'estado': MatriculaEstado.RECHAZADA})
        if not data and not errors:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_estudiante(self, request):
        estudiante_id = request.query_params.get('estudiante_id')
        if not estudiante_id:
            return Response({'error': 'Parámetro estudiante_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatriculaService.por_estudiante(int(estudiante_id)))

    @action(detail=False, methods=['get'])
    def por_paralelo(self, request):
        paralelo_id = request.query_params.get('paralelo_id')
        if not paralelo_id:
            return Response({'error': 'Parámetro paralelo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatriculaService.por_paralelo(int(paralelo_id)))

    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        estado = request.query_params.get('estado')
        if not estado:
            return Response({'error': 'Parámetro estado es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatriculaService.por_estado(estado))

    @action(detail=False, methods=['get'])
    def por_periodo(self, request):
        periodo_id = request.query_params.get('periodo_id')
        if not periodo_id:
            return Response({'error': 'Parámetro periodo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatriculaService.por_periodo(int(periodo_id)))

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        return Response(MatriculaService.estadisticas())

    @action(detail=True, methods=['get'])
    def requisitos(self, request, pk=None):
        from apps.matricula.services.requisito_service import RequisitoService
        return Response(RequisitoService.por_matricula(pk))

    @action(detail=True, methods=['get'])
    def requisitos_pendientes(self, request, pk=None):
        from apps.matricula.services.requisito_service import RequisitoService
        return Response(RequisitoService.pendientes_por_matricula(pk))

    @action(detail=False, methods=['get'])
    def estudiantes_por_paralelo(self, request):
        """Endpoint para Asistencia: estudiantes legalizados de un paralelo con nombres."""
        paralelo_id = request.query_params.get('paralelo_id')
        if not paralelo_id:
            return Response({'error': 'Parámetro paralelo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatriculaService.estudiantes_por_paralelo(int(paralelo_id)))
