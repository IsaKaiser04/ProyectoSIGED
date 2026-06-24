from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import DistributivoService


class DistributivoViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(DistributivoService.list_all())

    def retrieve(self, request, pk=None):
        data = DistributivoService.retrieve(pk)
        if not data:
            return Response({"error": "Distributivo no encontrado"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = DistributivoService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = DistributivoService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = DistributivoService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = DistributivoService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def por_anio_lectivo(self, request):
        anio_lectivo_id = request.query_params.get('anio_lectivo_id')
        return Response(DistributivoService.por_anio_lectivo(anio_lectivo_id))

    @action(detail=False, methods=['get'])
    def por_docente(self, request):
        docente_id = request.query_params.get('docente_id')
        return Response(DistributivoService.por_docente(docente_id))
