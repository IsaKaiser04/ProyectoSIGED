from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.asistencia.services.clase_service import ClaseService
from apps.asistencia.models import Clase


class ClaseViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(ClaseService.list_all())

    def retrieve(self, request, pk=None):
        data = ClaseService.retrieve(pk)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = ClaseService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = ClaseService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not ClaseService.delete(pk):
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def iniciar(self, request, pk=None):
        data, errors = ClaseService.update(pk, {'estado': Clase.ClaseEstado.EN_CURSO})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        data, errors = ClaseService.update(pk, {'estado': Clase.ClaseEstado.FINALIZADO})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        estado = request.query_params.get('estado')
        if not estado:
            return Response({'error': 'Debe proporcionar estado'}, status=status.HTTP_400_BAD_REQUEST)
        clases = Clase.objects.filter(estado=estado)
        from apps.asistencia.serializers.clase_serializer import ClaseSerializer
        return Response(ClaseSerializer(clases, many=True).data)

    @action(detail=False, methods=['get'])
    def por_distributivo(self, request):
        distributivo_id = request.query_params.get('distributivo_id')
        if not distributivo_id:
            return Response({'error': 'Debe proporcionar distributivo_id'}, status=status.HTTP_400_BAD_REQUEST)
        clases = Clase.objects.filter(distributivo_asignatura_id=distributivo_id)
        from apps.asistencia.serializers.clase_serializer import ClaseSerializer
        return Response(ClaseSerializer(clases, many=True).data)

    @action(detail=True, methods=['get'])
    def asistencias(self, request, pk=None):
        clase = Clase.objects.filter(pk=pk).first()
        if not clase:
            return Response({'error': 'Clase no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer
        return Response(AsistenciaSerializer(clase.asistencias.all(), many=True).data)