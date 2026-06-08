from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.asistencia.services.asistencia_service import AsistenciaService
from apps.asistencia.models import Asistencia


class AsistenciaViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(AsistenciaService.list_all())

    def retrieve(self, request, pk=None):
        data = AsistenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = AsistenciaService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = AsistenciaService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not AsistenciaService.delete(pk):
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_clase(self, request):
        clase_id = request.query_params.get('clase_id')
        if not clase_id:
            return Response({'error': 'Debe proporcionar clase_id'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(clase_id=clase_id)
        from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=False, methods=['get'])
    def por_matricula(self, request):
        matricula_id = request.query_params.get('matricula_id')
        if not matricula_id:
            return Response({'error': 'Debe proporcionar matricula_id'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(matricula_id=matricula_id)
        from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        tipo = request.query_params.get('tipo')
        if not tipo:
            return Response({'error': 'Debe proporcionar tipo'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(tipo=tipo)
        from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=True, methods=['get'])
    def incidencias(self, request, pk=None):
        asistencia = Asistencia.objects.filter(pk=pk).first()
        if not asistencia:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        from apps.asistencia.serializers.incidencia_serializer import IncidenciaSerializer
        return Response(IncidenciaSerializer(asistencia.incidencias.all(), many=True).data)