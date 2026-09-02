from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.matricula.services.documento_service import DocumentoService


class DocumentoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        return Response(DocumentoService.list_documentos(
            matricula_id=request.query_params.get('matricula_id'),
            estado=request.query_params.get('estado'),
            texto=request.query_params.get('texto'),
        ))

    def retrieve(self, request, pk=None):
        data = DocumentoService.retrieve(pk)
        if not data:
            return Response({'error': 'Documento no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)