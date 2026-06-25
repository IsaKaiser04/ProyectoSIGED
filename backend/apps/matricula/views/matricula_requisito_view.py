from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.matricula_requisito_service import MatriculaRequisitoService


class MatriculaRequisitoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(MatriculaRequisitoService.list_all())

    def retrieve(self, request, pk=None):
        data = MatriculaRequisitoService.retrieve(pk)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        secretaria = getattr(request.user, 'perfil_secretaria', None)
        if secretaria and secretaria.institucion_id:
            mutable_data['institucion_id'] = secretaria.institucion_id
        data, errors = MatriculaRequisitoService.create(mutable_data)
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
