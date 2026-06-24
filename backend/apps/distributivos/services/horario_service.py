from ..repositories import HorarioRepository
from ..serializers.horario_serializer import (
    HorarioListSerializer,
    HorarioDetailSerializer,
    HorarioCreateSerializer,
)


class HorarioService:
    @staticmethod
    def list_all():
        instances = HorarioRepository.get_all()
        return HorarioListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return None
        return HorarioDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = HorarioCreateSerializer(data=data)
        if serializer.is_valid():
            instance = HorarioRepository.create(serializer.validated_data)
            return HorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Horario no encontrado"}
        serializer = HorarioCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = HorarioRepository.update(instance, serializer.validated_data)
            return HorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Horario no encontrado"}
        HorarioRepository.delete(pk)
        return True, None

    @staticmethod
    def por_distributivo(distributivo_id):
        instances = HorarioRepository.filter_by_distributivo(distributivo_id)
        return HorarioListSerializer(instances, many=True).data

    @staticmethod
    def por_distributivo_asignatura(distributivo_asignatura_id):
        instances = HorarioRepository.filter_by_distributivo_asignatura(distributivo_asignatura_id)
        return HorarioListSerializer(instances, many=True).data
