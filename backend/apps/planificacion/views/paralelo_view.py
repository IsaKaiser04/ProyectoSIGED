from rest_framework import viewsets, status
from rest_framework.response import Response
from ..services.paralelo_service import ParaleloService


class ParaleloViewSet(viewsets.ViewSet):
    # permission_classes = [IsAuthenticated]

    def list(self, request):
        grado_ofertado_id = request.query_params.get('grado_ofertado_id')
        if grado_ofertado_id:
            return Response(ParaleloService.por_grado_ofertado(int(grado_ofertado_id)))
        return Response(ParaleloService.list_all())

    def retrieve(self, request, pk=None):
        data = ParaleloService.retrieve(pk)
        if not data:
            return Response({'error': 'Paralelo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = ParaleloService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = ParaleloService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def partial_update(self, request, pk=None):
        data, errors = ParaleloService.partial_update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        errors, http_status = ParaleloService.delete(pk)
        if errors:
            return Response(errors, status=http_status)
        return Response(status=status.HTTP_204_NO_CONTENT)
