from apps.matricula.repositories.requisito_repository import RequisitoRepository
from apps.matricula.serializers.requisito_serializer import RequisitoSerializer


class RequisitoService:
    @staticmethod
    def list_all():
        return RequisitoSerializer(RequisitoRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        requisito = RequisitoRepository.get_by_id(pk)
        return RequisitoSerializer(requisito).data if requisito else None

    @staticmethod
    def create(data):
        serializer = RequisitoSerializer(data=data)
        if serializer.is_valid():
            instance = RequisitoRepository.create(serializer.validated_data)
            return RequisitoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return None
        serializer = RequisitoSerializer(requisito, data=data, partial=True)
        if serializer.is_valid():
            instance = RequisitoRepository.update(requisito, serializer.validated_data)
            return RequisitoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        requisito = RequisitoRepository.get_by_id(pk)
        if not requisito:
            return False
        RequisitoRepository.delete(requisito)
        return True
