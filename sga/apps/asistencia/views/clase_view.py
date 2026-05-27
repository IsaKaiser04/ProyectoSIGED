from rest_framework import viewsets, status
from rest_framework.response import Response
from apps.asistencia.services.clase_service import ClaseService


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