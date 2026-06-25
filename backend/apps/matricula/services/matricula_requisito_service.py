from apps.matricula.repositories.matricula_requisito_repository import MatriculaRequisitoRepository
from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer


class MatriculaRequisitoService:
    @staticmethod
    def list_all():
        return MatriculaRequisitoSerializer(MatriculaRequisitoRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        requisito = MatriculaRequisitoRepository.get_by_id(pk)
        return MatriculaRequisitoSerializer(requisito).data if requisito else None

    @staticmethod
    def create(data):
        serializer = MatriculaRequisitoSerializer(data=data)
        if serializer.is_valid():
            instance = MatriculaRequisitoRepository.create(serializer.validated_data)
            return MatriculaRequisitoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        requisito = MatriculaRequisitoRepository.get_by_id(pk)
        if not requisito:
            return None
        serializer = MatriculaRequisitoSerializer(requisito, data=data, partial=True)
        if serializer.is_valid():
            instance = MatriculaRequisitoRepository.update(requisito, serializer.validated_data)
            return MatriculaRequisitoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        requisito = MatriculaRequisitoRepository.get_by_id(pk)
        if not requisito:
            return False
        MatriculaRequisitoRepository.delete(requisito)
        return True
