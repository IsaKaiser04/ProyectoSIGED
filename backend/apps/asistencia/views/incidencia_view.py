from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.asistencia.services.incidencia_service import IncidenciaService
from apps.asistencia.models import Incidencia
from apps.asistencia.serializers.incidencia_serializer import IncidenciaSerializer


class IncidenciaViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(IncidenciaService.list_all())

    def retrieve(self, request, pk=None):
        data = IncidenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = IncidenciaService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = IncidenciaService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not IncidenciaService.delete(pk):
            return Response({'error': 'Incidencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_asistencia(self, request):
        asistencia_id = request.query_params.get('asistencia_id')
        if not asistencia_id:
            return Response({'error': 'Debe proporcionar asistencia_id'}, status=status.HTTP_400_BAD_REQUEST)
        incidencias = Incidencia.objects.filter(asistencia_id=asistencia_id)
        return Response(IncidenciaSerializer(incidencias, many=True).data)