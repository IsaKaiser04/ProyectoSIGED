from apps.matricula.repositories.documento_repository import DocumentoRepository
from apps.matricula.serializers.documento_serializer import DocumentoMatriculaSerializer


class DocumentoService:
    @staticmethod
    def list_documentos(matricula_id=None, estado=None, texto=None):
        qs = DocumentoRepository.get_documentos()
        if matricula_id:
            qs = qs.filter(matricula_id=matricula_id)
        if estado:
            qs = qs.filter(estado=estado)
        if texto:
            qs = DocumentoRepository.buscar_documentos(texto) & qs
        return DocumentoMatriculaSerializer(qs, many=True).data

    @staticmethod
    def retrieve(pk):
        requisito = DocumentoRepository.get_documentos().filter(pk=pk).first()
        if not requisito:
            return None
        return DocumentoMatriculaSerializer(requisito).data