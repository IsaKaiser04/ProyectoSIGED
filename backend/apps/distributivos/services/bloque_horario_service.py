from ..repositories import BloqueHorarioRepository
from ..serializers.bloque_horario_serializer import (
    BloqueHorarioListSerializer,
    BloqueHorarioDetailSerializer,
    BloqueHorarioCreateSerializer,
)


class BloqueHorarioService:
    @staticmethod
    def list_all():
        instances = BloqueHorarioRepository.get_all()
        return BloqueHorarioListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = BloqueHorarioRepository.get_by_id(pk)
        if not instance:
            return None
        return BloqueHorarioDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = BloqueHorarioCreateSerializer(data=data)
        if serializer.is_valid():
            instance = BloqueHorarioRepository.create(serializer.validated_data)
            return BloqueHorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = BloqueHorarioRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Bloque horario no encontrado"}
        serializer = BloqueHorarioCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = BloqueHorarioRepository.update(instance, serializer.validated_data)
            return BloqueHorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = BloqueHorarioRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Bloque horario no encontrado"}
        BloqueHorarioRepository.delete(pk)
        return True, None

    @staticmethod
    def por_paralelo(paralelo_id):
        instances = BloqueHorarioRepository.filter_by_paralelo(paralelo_id)
        return BloqueHorarioListSerializer(instances, many=True).data
