from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import PlanificacionCurricularHistorialService


class PlanificacionCurricularHistorialViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(PlanificacionCurricularHistorialService.list_all())

    def retrieve(self, request, pk=None):
        data = PlanificacionCurricularHistorialService.retrieve(pk)
        if not data:
            return Response({"error": "Registro no encontrado"}, status=404)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_planificacion(self, request):
        planificacion_id = request.query_params.get('planificacion_id')
        return Response(
            PlanificacionCurricularHistorialService.por_planificacion(planificacion_id)
        )
