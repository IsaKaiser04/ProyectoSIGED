from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.asistencia.services.justificacion_service import JustificacionService


class JustificacionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Listar justificaciones (admin/secretaría)."""
        # TODO: Validar rol secretaría o admin
        matricula_id = request.query_params.get('matricula_id')
        if matricula_id:
            return Response(JustificacionService.por_matricula(int(matricula_id)))
        return Response(JustificacionService.list_all())

    def retrieve(self, request, pk=None):
        data = JustificacionService.retrieve(pk)
        if not data:
            return Response({'error': 'Justificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        """El representante crea una solicitud de justificación.
        
        Body:
        {
            "asistencia_id": 1,
            "motivo": "El estudiante fue al médico",
            "archivo": <file>
        }
        """
        # TODO: Validar que el usuario sea representante del alumno
        if 'archivo' not in request.FILES:
            return Response({'error': 'El archivo de evidencia es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['archivo'] = request.FILES['archivo']

        result, errors = JustificacionService.crear_solicitud(data, request.user)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        """Eliminar justificación (solo si está pendiente)."""
        if not JustificacionService.delete(pk):
            return Response(
                {'error': 'No se pudo eliminar. Solo se pueden eliminar justificaciones pendientes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """GET /api/asistencia/justificaciones/pendientes/
        
        Justificaciones pendientes de resolución.
        Vista principal para la secretaría.
        """
        # TODO: Validar rol secretaría
        return Response(JustificacionService.get_pendientes())

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """POST /api/asistencia/justificaciones/{id}/aprobar/
        
        Aprobar justificación. Cambia la asistencia a JUSTIFICADO.
        """
        # TODO: Validar rol secretaría
        data = {
            'estado': 'APROBADA',
            'observacion_secretaria': request.data.get('observacion_secretaria', '')
        }
        result, errors = JustificacionService.resolver(pk, data, request.user)
        if not result and not errors:
            return Response({'error': 'Justificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """POST /api/asistencia/justificaciones/{id}/rechazar/
        
        Rechazar justificación. La asistencia sigue como INASISTENCIA.
        Requiere observación de por qué se rechaza.
        """
        # TODO: Validar rol secretaría
        observacion = request.data.get('observacion_secretaria', '')
        if not observacion:
            return Response(
                {'error': 'Debe indicar el motivo del rechazo en observacion_secretaria'},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = {
            'estado': 'RECHAZADA',
            'observacion_secretaria': observacion
        }
        result, errors = JustificacionService.resolver(pk, data, request.user)
        if not result and not errors:
            return Response({'error': 'Justificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(result)
