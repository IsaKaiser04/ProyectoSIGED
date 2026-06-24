from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.representante_service import RepresentanteService


class RepresentanteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(RepresentanteService.list_all())

    @action(detail=False, methods=['get'])
    def por_identificacion(self, request):
        identificacion = request.query_params.get('identificacion')
        if not identificacion:
            return Response({'error': 'identificacion es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        data = RepresentanteService.por_identificacion(identificacion)
        if data:
            return Response({'existe': True, 'representante': data})
        return Response({'existe': False})

    def retrieve(self, request, pk=None):
        data = RepresentanteService.retrieve(pk)
        if not data:
            return Response({'error': 'Representante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = RepresentanteService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = RepresentanteService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Representante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not RepresentanteService.delete(pk):
            return Response({'error': 'Representante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
