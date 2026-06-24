from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import HorarioService


class HorarioViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(HorarioService.list_all())

    def retrieve(self, request, pk=None):
        data = HorarioService.retrieve(pk)
        if not data:
            return Response({"error": "Horario no encontrado"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = HorarioService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = HorarioService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = HorarioService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = HorarioService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def por_distributivo(self, request):
        distributivo_id = request.query_params.get('distributivo_id')
        return Response(HorarioService.por_distributivo(distributivo_id))

    @action(detail=False, methods=['get'])
    def por_distributivo_asignatura(self, request):
        distributivo_asignatura_id = request.query_params.get('distributivo_asignatura_id')
        return Response(HorarioService.por_distributivo_asignatura(distributivo_asignatura_id))
