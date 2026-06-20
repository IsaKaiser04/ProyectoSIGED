from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.matricula.services.requisito_service import RequisitoService
from apps.matricula.models import Requisito


class RequisitoViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(RequisitoService.list_all())

    def retrieve(self, request, pk=None):
        data = RequisitoService.retrieve(pk)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = RequisitoService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = RequisitoService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not RequisitoService.delete(pk):
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None):
        data, errors = RequisitoService.update(pk, {'estado': Requisito.RequisitoEstado.VALIDADO})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        data, errors = RequisitoService.update(pk, {'estado': Requisito.RequisitoEstado.NO_VALIDADO})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_matricula(self, request):
        matricula_id = request.query_params.get('matricula_id')
        if not matricula_id:
            return Response({'error': 'Debe proporcionar matricula_id'}, status=status.HTTP_400_BAD_REQUEST)
        requisitos = Requisito.objects.filter(matricula_id=matricula_id)
        from apps.matricula.serializers.requisito_serializer import RequisitoSerializer
        return Response(RequisitoSerializer(requisitos, many=True).data)

    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        estado = request.query_params.get('estado')
        if not estado:
            return Response({'error': 'Debe proporcionar estado'}, status=status.HTTP_400_BAD_REQUEST)
        requisitos = Requisito.objects.filter(estado=estado)
        from apps.matricula.serializers.requisito_serializer import RequisitoSerializer
        return Response(RequisitoSerializer(requisitos, many=True).data)