from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import BloqueHorarioService


class BloqueHorarioViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(BloqueHorarioService.list_all())

    def retrieve(self, request, pk=None):
        data = BloqueHorarioService.retrieve(pk)
        if not data:
            return Response({"error": "Bloque horario no encontrado"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = BloqueHorarioService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = BloqueHorarioService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = BloqueHorarioService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = BloqueHorarioService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=False, methods=['get'], url_path='por-paralelo')
    def por_paralelo(self, request):
        paralelo_id = request.query_params.get('paralelo_id')
        if not paralelo_id:
            return Response({'error': 'paralelo_id es obligatorio'}, status=400)
        return Response(BloqueHorarioService.por_paralelo(paralelo_id))
