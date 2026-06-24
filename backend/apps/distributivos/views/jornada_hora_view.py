from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import JornadaHoraService


class JornadaHoraViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(JornadaHoraService.list_all())

    def retrieve(self, request, pk=None):
        data = JornadaHoraService.retrieve(pk)
        if not data:
            return Response({"error": "Jornada no encontrada"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = JornadaHoraService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = JornadaHoraService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = JornadaHoraService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = JornadaHoraService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def por_institucion(self, request):
        institucion_id = request.query_params.get('institucion_id')
        return Response(JornadaHoraService.por_institucion(institucion_id))
