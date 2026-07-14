from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.requisito_service import RequisitoService


class RequisitoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

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

    @action(detail=True, methods=['post'])
    def validar(self, request, pk=None):
        data, errors = RequisitoService.validar(pk, request.user.id)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        observacion = request.data.get('observacion', '')
        data, errors = RequisitoService.rechazar(pk, request.user.id, observacion)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def solicitar_correccion(self, request, pk=None):
        data, errors = RequisitoService.solicitar_correccion(pk)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def subir_archivo(self, request, pk=None):
        archivo = request.FILES.get('archivo')
        data, errors = RequisitoService.subir_archivo(pk, archivo)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        if not RequisitoService.delete(pk):
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
