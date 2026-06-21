from apps.matricula.repositories.retiro_repository import RetiroRepository
from apps.matricula.serializers.retiro_serializer import RetiroSerializer


class RetiroService:
    @staticmethod
    def list_all():
        return RetiroSerializer(RetiroRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        retiro = RetiroRepository.get_by_id(pk)
        return RetiroSerializer(retiro).data if retiro else None

    @staticmethod
    def create(data):
        serializer = RetiroSerializer(data=data)
        if serializer.is_valid():
            instance = RetiroRepository.create(serializer.validated_data)
            return RetiroSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        retiro = RetiroRepository.get_by_id(pk)
        if not retiro:
            return None
        serializer = RetiroSerializer(retiro, data=data, partial=True)
        if serializer.is_valid():
            instance = RetiroRepository.update(retiro, serializer.validated_data)
            return RetiroSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        retiro = RetiroRepository.get_by_id(pk)
        if not retiro:
            return False
        RetiroRepository.delete(retiro)
        return True
