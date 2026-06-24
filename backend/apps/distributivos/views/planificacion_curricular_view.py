from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import PlanificacionCurricularService


class PlanificacionCurricularViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(PlanificacionCurricularService.list_all())

    def retrieve(self, request, pk=None):
        data = PlanificacionCurricularService.retrieve(pk)
        if not data:
            return Response({"error": "Planificación no encontrada"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = PlanificacionCurricularService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = PlanificacionCurricularService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = PlanificacionCurricularService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = PlanificacionCurricularService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=True, methods=['post'])
    def enviar_aprobacion(self, request, pk=None):
        observacion = request.data.get('observacion', '')
        data, errors = PlanificacionCurricularService.enviar_aprobacion(pk, observacion)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        observacion = request.data.get('observacion', '')
        data, errors = PlanificacionCurricularService.aprobar(pk, observacion)
        if errors:
            return Response(errors, status=400)
        return Response(data)
