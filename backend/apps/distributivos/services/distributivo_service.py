from ..repositories import DistributivoRepository
from ..serializers.distributivo_serializer import (
    DistributivoListSerializer,
    DistributivoDetailSerializer,
    DistributivoCreateSerializer,
)


class DistributivoService:
    @staticmethod
    def list_all():
        instances = DistributivoRepository.get_all()
        return DistributivoListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = DistributivoRepository.get_by_id(pk)
        if not instance:
            return None
        return DistributivoDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = DistributivoCreateSerializer(data=data)
        if serializer.is_valid():
            instance = DistributivoRepository.create(serializer.validated_data)
            return DistributivoDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = DistributivoRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Distributivo no encontrado"}
        serializer = DistributivoCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = DistributivoRepository.update(instance, serializer.validated_data)
            return DistributivoDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = DistributivoRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Distributivo no encontrado"}
        DistributivoRepository.delete(pk)
        return True, None

    @staticmethod
    def por_anio_lectivo(anio_lectivo_id):
        instances = DistributivoRepository.filter_by_anio_lectivo(anio_lectivo_id)
        return DistributivoListSerializer(instances, many=True).data

    @staticmethod
    def por_docente(docente_id):
        instances = DistributivoRepository.filter_by_docente(docente_id)
        return DistributivoListSerializer(instances, many=True).data
