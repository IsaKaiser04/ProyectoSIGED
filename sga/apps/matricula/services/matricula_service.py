from apps.matricula.repositories.matricula_repository import MatriculaRepository
from apps.matricula.serializers.matricula_serializer import MatriculaSerializer


class MatriculaService:
    @staticmethod
    def list_all():
        return MatriculaSerializer(MatriculaRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        matricula = MatriculaRepository.get_by_id(pk)
        return MatriculaSerializer(matricula).data if matricula else None

    @staticmethod
    def create(data):
        serializer = MatriculaSerializer(data=data)
        if serializer.is_valid():
            instance = MatriculaRepository.create(serializer.validated_data)
            return MatriculaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        matricula = MatriculaRepository.get_by_id(pk)
        if not matricula:
            return None
        serializer = MatriculaSerializer(matricula, data=data, partial=True)
        if serializer.is_valid():
            instance = MatriculaRepository.update(matricula, serializer.validated_data)
            return MatriculaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        matricula = MatriculaRepository.get_by_id(pk)
        if not matricula:
            return False
        MatriculaRepository.delete(matricula)
        return True
