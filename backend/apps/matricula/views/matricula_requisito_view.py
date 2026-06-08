from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.matricula.services.matricula_requisito_service import MatriculaRequisitoService
from apps.matricula.models import MatriculaRequisito


class MatriculaRequisitoViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(MatriculaRequisitoService.list_all())

    def retrieve(self, request, pk=None):
        data = MatriculaRequisitoService.retrieve(pk)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = MatriculaRequisitoService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = MatriculaRequisitoService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not MatriculaRequisitoService.delete(pk):
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        tipo = request.query_params.get('tipo')
        if not tipo:
            return Response({'error': 'Debe proporcionar tipo'}, status=status.HTTP_400_BAD_REQUEST)
        requisitos = MatriculaRequisito.objects.filter(tipo=tipo)
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return Response(MatriculaRequisitoSerializer(requisitos, many=True).data)