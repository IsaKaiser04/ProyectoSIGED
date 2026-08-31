import os
from django.http import FileResponse, HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.requisito_service import RequisitoService
from apps.matricula.repositories.requisito_repository import RequisitoRepository


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

    @action(
        detail=True, methods=['get'],
        authentication_classes=[], permission_classes=[]
    )
    def archivo(self, request, pk=None):
        """Sirve el PDF del requisito para visualizarlo (inline) con el nombre
        legible del certificado. Acepta el token JWT por header o por query (?token=)."""
        if not requisito_autenticado(request):
            return HttpResponse('No autorizado', status=status.HTTP_401_UNAUTHORIZED)

        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito or not requisito.archivo:
            return Response({'error': 'Documento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        nombre_base = requisito.matricula_requisito.nombre if requisito.matricula_requisito else f'requisito_{pk}'
        nombre_archivo = f"{nombre_base}.pdf"

        response = FileResponse(
            requisito.archivo.open('rb'),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}"'
        response['X-Frame-Options'] = 'SAMEORIGIN'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response

    def destroy(self, request, pk=None):
        if not RequisitoService.delete(pk):
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


def requisito_autenticado(request):
    """Valida el JWT presente en el header Authorization o en la query (?token=).
    Devuelve True si el usuario está autenticado."""
    import copy
    from rest_framework.exceptions import AuthenticationFailed
    from apps.actoresAcademicos.authentication import JwtAuthentication

    auth = JwtAuthentication()
    if 'HTTP_AUTHORIZATION' in request.META:
        try:
            auth.authenticate(request)
            return True
        except AuthenticationFailed:
            return False

    token = request.query_params.get('token')
    if token:
        mrequest = copy.copy(request)
        mrequest.META = {**request.META, 'HTTP_AUTHORIZATION': f'Bearer {token}'}
        try:
            auth.authenticate(mrequest)
            return True
        except AuthenticationFailed:
            return False
    return False
