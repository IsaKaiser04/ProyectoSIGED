from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..services.anio_lectivo_service import AnioLectivoService


class AnioLectivoViewSet(viewsets.ViewSet):
    # permission_classes = [IsAuthenticated]  # Se habilitará cuando se implemente RBAC

    def list(self, request):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        return Response(AnioLectivoService.list_all(institucion_id))

    def retrieve(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        data = AnioLectivoService.retrieve(pk, institucion_id)
        if data is None:
            return Response({'error': 'Año lectivo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        data, errors = AnioLectivoService.create(request.data, institucion_id)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        data, errors, http_status = AnioLectivoService.update(pk, request.data, institucion_id)
        if errors:
            return Response(errors, status=http_status or status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def partial_update(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        data, errors, http_status = AnioLectivoService.partial_update(pk, request.data, institucion_id)
        if errors:
            return Response(errors, status=http_status or status.HTTP_400_BAD_REQUEST)
        return Response(data)

    def destroy(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        errors, http_status = AnioLectivoService.delete(pk, institucion_id)
        if errors:
            return Response(errors, status=http_status)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def activos(self, request):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        return Response(AnioLectivoService.list_activos(institucion_id))

    @action(detail=True, methods=['get'])
    def periodos(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        return Response(AnioLectivoService.get_periodos(pk, institucion_id))

    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        data, error = AnioLectivoService.activate(pk, institucion_id)
        if error:
            return Response(error, status=error.get('status', status.HTTP_400_BAD_REQUEST))
        return Response(data)

    @action(detail=False, methods=['get'])
    def exists_activo(self, request):
        auth = getattr(request, 'auth', None)
        institucion_id = auth.get('institucion_id') if auth else None
        return Response({'exists': AnioLectivoService.activate_exists(institucion_id)})
