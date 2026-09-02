from django.db.models import Q
from apps.matricula.models import Requisito


class DocumentoRepository:
    @staticmethod
    def get_documentos():
        return (
            Requisito.objects
            .select_related(
                'matricula',
                'matricula__paralelo',
                'matricula__anio_lectivo',
                'matricula_requisito',
                'revisado_por',
            )
            .order_by('-matricula_id', 'id')
        )

    @staticmethod
    def get_por_matricula(matricula_id):
        return DocumentoRepository.get_documentos().filter(matricula_id=matricula_id)

    @staticmethod
    def buscar_documentos(texto):
        return DocumentoRepository.get_documentos().filter(
            Q(matricula__asp_nombres__icontains=texto)
            | Q(matricula__asp_apellidos__icontains=texto)
            | Q(matricula__asp_identificacion__icontains=texto)
        )