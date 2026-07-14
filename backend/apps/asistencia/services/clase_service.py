from apps.asistencia.repositories.clase_repository import ClaseRepository
from apps.asistencia.serializers.clase_serializer import ClaseSerializer


class ClaseService:
    @staticmethod
    def list_all():
        return ClaseSerializer(ClaseRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        clase = ClaseRepository.get_by_id(pk)
        return ClaseSerializer(clase).data if clase else None

    @staticmethod
    def create(data):
        serializer = ClaseSerializer(data=data)
        if serializer.is_valid():
            instance = ClaseRepository.create(serializer.validated_data)
            return ClaseSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        clase = ClaseRepository.get_by_id(pk)
        if not clase:
            return None, None
        serializer = ClaseSerializer(clase, data=data, partial=True)
        if serializer.is_valid():
            instance = ClaseRepository.update(clase, serializer.validated_data)
            return ClaseSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        clase = ClaseRepository.get_by_id(pk)
        if not clase:
            return False
        ClaseRepository.delete(clase)
        return True