from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.matricula.services.retiro_service import RetiroService
from apps.matricula.models import Retiro


class RetiroViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(RetiroService.list_all())

    def retrieve(self, request, pk=None):
        data = RetiroService.retrieve(pk)
        if not data:
            return Response({'error': 'Retiro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = RetiroService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = RetiroService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Retiro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not RetiroService.delete(pk):
            return Response({'error': 'Retiro no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_matricula(self, request):
        matricula_id = request.query_params.get('matricula_id')
        if not matricula_id:
            return Response({'error': 'Debe proporcionar matricula_id'}, status=status.HTTP_400_BAD_REQUEST)
        retiros = Retiro.objects.filter(matricula_id=matricula_id)
        from apps.matricula.serializers.retiro_serializer import RetiroSerializer
        return Response(RetiroSerializer(retiros, many=True).data)