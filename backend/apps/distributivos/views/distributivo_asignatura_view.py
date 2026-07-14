from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..services import DistributivoAsignaturaService


class DistributivoAsignaturaViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(DistributivoAsignaturaService.list_all())

    def retrieve(self, request, pk=None):
        data = DistributivoAsignaturaService.retrieve(pk)
        if not data:
            return Response({"error": "Asignatura de distributivo no encontrada"}, status=404)
        return Response(data)

    def create(self, request):
        data, errors = DistributivoAsignaturaService.create(request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data, status=201)

    def update(self, request, pk=None):
        data, errors = DistributivoAsignaturaService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = DistributivoAsignaturaService.update(pk, request.data)
        if errors:
            return Response(errors, status=400)
        return Response(data)

    def destroy(self, request, pk=None):
        success, errors = DistributivoAsignaturaService.delete(pk)
        if not success:
            return Response(errors, status=404)
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def por_distributivo(self, request):
        distributivo_id = request.query_params.get('distributivo_id')
        return Response(DistributivoAsignaturaService.por_distributivo(distributivo_id))

    @action(detail=False, methods=['get'])
    def mis_asignaturas(self, request):
        return Response(DistributivoAsignaturaService.por_docente_actual(request))
