from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.asistencia.services.asistencia_service import AsistenciaService


class AsistenciaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Listar todas las asistencias (solo admin)."""
        # TODO: Validar rol administrador
        return Response(AsistenciaService.list_all())

    def retrieve(self, request, pk=None):
        data = AsistenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        """Crear registro individual de asistencia."""
        # TODO: Validar que sea DOCENTE y tenga permiso sobre la clase
        data, errors = AsistenciaService.create(request.data, request.user)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        """Actualizar tipo de asistencia (clic en cuadrícula)."""
        data, errors = AsistenciaService.update_tipo(pk, request.data, request.user)
        if not data and not errors:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        # TODO: Solo admin puede eliminar
        if not AsistenciaService.delete(pk):
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def masiva(self, request):
        """Registro masivo de asistencia para una clase.
        
        Body esperado:
        {
            "clase_id": 1,
            "notificar": false,
            "asistencias": [
                {"matricula_id": 1, "tipo": "ASISTENCIA", "observacion": ""},
                {"matricula_id": 2, "tipo": "INASISTENCIA", "observacion": "No vino"},
                {"matricula_id": 3, "tipo": "ATRASADO", "observacion": "Llegó 10 min tarde"}
            ]
        }
        """
        # TODO: Validar que sea DOCENTE y la clase sea suya
        data, errors = AsistenciaService.create_masiva(request.data, request.user)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def por_clase(self, request):
        """GET /api/asistencia/asistencias/por_clase/?clase_id=1"""
        clase_id = request.query_params.get('clase_id')
        if not clase_id:
            return Response({'error': 'Parámetro clase_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AsistenciaService.por_clase(clase_id))

    @action(detail=False, methods=['get'])
    def por_matricula(self, request):
        """GET /api/asistencia/asistencias/por_matricula/?matricula_id=1"""
        matricula_id = request.query_params.get('matricula_id')
        if not matricula_id:
            return Response({'error': 'Parámetro matricula_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AsistenciaService.por_matricula(matricula_id))

    @action(detail=False, methods=['get'])
    def por_periodo(self, request):
        """GET /api/asistencia/asistencias/por_periodo/?matricula_id=1&fecha_inicio=2025-01-01&fecha_fin=2025-03-31"""
        matricula_id = request.query_params.get('matricula_id')
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if not all([matricula_id, fecha_inicio, fecha_fin]):
            return Response(
                {'error': 'Parámetros requeridos: matricula_id, fecha_inicio, fecha_fin'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(AsistenciaService.por_matricula_periodo(
            int(matricula_id), fecha_inicio, fecha_fin
        ))

    @action(detail=False, methods=['get'])
    def estadisticas_clase(self, request):
        """GET /api/asistencia/asistencias/estadisticas_clase/?clase_id=1"""
        clase_id = request.query_params.get('clase_id')
        if not clase_id:
            return Response({'error': 'Parámetro clase_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(AsistenciaService.get_estadisticas_clase(clase_id))

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """GET /api/asistencia/asistencias/pendientes/?distributivo_id=1&fecha=2025-01-15
        
        Clases sin asistencia registrada para un docente.
        """
        distributivo_id = request.query_params.get('distributivo_id')
        fecha = request.query_params.get('fecha')

        if not all([distributivo_id, fecha]):
            return Response(
                {'error': 'Parámetros requeridos: distributivo_id, fecha'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(AsistenciaService.get_pendientes_docente(
            int(distributivo_id), fecha
        ))

    @action(detail=True, methods=['get'])
    def incidencias(self, request, pk=None):
        """GET /api/asistencia/asistencias/{id}/incidencias/"""
        from apps.asistencia.services.incidencia_service import IncidenciaService
        data = AsistenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(IncidenciaService.por_asistencia(pk))
