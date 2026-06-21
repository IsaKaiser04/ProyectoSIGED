from apps.asistencia.repositories.asistencia_repository import AsistenciaRepository
from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer


class AsistenciaService:
    @staticmethod
    def list_all():
        return AsistenciaSerializer(AsistenciaRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        asistencia = AsistenciaRepository.get_by_id(pk)
        return AsistenciaSerializer(asistencia).data if asistencia else None

    @staticmethod
    def create(data):
        serializer = AsistenciaSerializer(data=data)
        if serializer.is_valid():
            instance = AsistenciaRepository.create(serializer.validated_data)
            return AsistenciaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        asistencia = AsistenciaRepository.get_by_id(pk)
        if not asistencia:
            return None, None
        serializer = AsistenciaSerializer(asistencia, data=data, partial=True)
        if serializer.is_valid():
            instance = AsistenciaRepository.update(asistencia, serializer.validated_data)
            return AsistenciaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        asistencia = AsistenciaRepository.get_by_id(pk)
        if not asistencia:
            return False
        AsistenciaRepository.delete(asistencia)
        return True