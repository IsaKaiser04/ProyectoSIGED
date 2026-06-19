from apps.matricula.repositories.matricula_periodo_repository import MatriculaPeriodoRepository
from apps.matricula.serializers.matricula_periodo_serializer import MatriculaPeriodoSerializer


class MatriculaPeriodoService:
    @staticmethod
    def list_all():
        return MatriculaPeriodoSerializer(MatriculaPeriodoRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        return MatriculaPeriodoSerializer(periodo).data if periodo else None

    @staticmethod
    def create(data):
        serializer = MatriculaPeriodoSerializer(data=data)
        if serializer.is_valid():
            instance = MatriculaPeriodoRepository.create(serializer.validated_data)
            return MatriculaPeriodoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        if not periodo:
            return None
        serializer = MatriculaPeriodoSerializer(periodo, data=data, partial=True)
        if serializer.is_valid():
            instance = MatriculaPeriodoRepository.update(periodo, serializer.validated_data)
            return MatriculaPeriodoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        if not periodo:
            return False
        MatriculaPeriodoRepository.delete(periodo)
        return True
