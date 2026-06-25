from django.utils import timezone
from apps.matricula.repositories.requisito_repository import RequisitoRepository
from apps.matricula.serializers.requisito_serializer import RequisitoListSerializer


class RequisitoService:
    @staticmethod
    def list_all():
        return RequisitoListSerializer(RequisitoRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None
        return RequisitoListSerializer(requisito).data

    @staticmethod
    def por_matricula(matricula_id):
        instances = RequisitoRepository.get_por_matricula(matricula_id)
        return RequisitoListSerializer(instances, many=True).data

    @staticmethod
    def pendientes_por_matricula(matricula_id):
        instances = RequisitoRepository.get_pendientes_por_matricula(matricula_id)
        return RequisitoListSerializer(instances, many=True).data

    @staticmethod
    def create(data):
        from apps.matricula.serializers.requisito_serializer import RequisitoCreateSerializer
        serializer = RequisitoCreateSerializer(data=data)
        if serializer.is_valid():
            instance = RequisitoRepository.create(serializer.validated_data)
            return RequisitoListSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def validar(pk, user_id):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None, {"error": "Requisito no encontrado"}
        RequisitoRepository.update(requisito, {
            'estado': 'Validado',
            'revisado_por_id': user_id,
            'fecha_revision': timezone.now()
        })
        return RequisitoListSerializer(RequisitoRepository.get_by_id(pk)).data, None

    @staticmethod
    def rechazar(pk, user_id, observacion=""):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None, {"error": "Requisito no encontrado"}
        if not observacion:
            return None, {"error": "La observacion es obligatoria para rechazar"}
        RequisitoRepository.update(requisito, {
            'estado': 'No validado',
            'revisado_por_id': user_id,
            'fecha_revision': timezone.now(),
            'observacion': observacion
        })
        return RequisitoListSerializer(RequisitoRepository.get_by_id(pk)).data, None

    @staticmethod
    def solicitar_correccion(pk):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None, {"error": "Requisito no encontrado"}
        if requisito.estado != 'No validado':
            return None, {"error": "Solo se puede solicitar corrección de requisitos rechazados"}
        RequisitoRepository.update(requisito, {
            'estado': 'Pendiente',
            'revisado_por_id': None,
            'fecha_revision': None,
        })
        return RequisitoListSerializer(RequisitoRepository.get_by_id(pk)).data, None

    @staticmethod
    def subir_archivo(pk, archivo):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None, {"error": "Requisito no encontrado"}
        if not archivo:
            return None, {"error": "Debe adjuntar un archivo PDF"}
        RequisitoRepository.update(requisito, {
            'archivo': archivo,
            'estado': 'Pendiente',
            'revisado_por_id': None,
            'fecha_revision': None,
        })
        return RequisitoListSerializer(RequisitoRepository.get_by_id(pk)).data, None

    @staticmethod
    def delete(pk):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return False
        RequisitoRepository.delete(requisito)
        return True
