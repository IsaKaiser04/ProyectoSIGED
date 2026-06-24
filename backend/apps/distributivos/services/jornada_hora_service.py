from ..models import JornadaHora
from ..repositories import JornadaHoraRepository
from ..serializers.jornada_hora_serializer import (
    JornadaHoraListSerializer,
    JornadaHoraDetailSerializer,
    JornadaHoraCreateSerializer,
)


class JornadaHoraService:
    @staticmethod
    def list_all():
        instances = JornadaHoraRepository.get_all()
        return JornadaHoraListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = JornadaHoraRepository.get_by_id(pk)
        if not instance:
            return None
        return JornadaHoraDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = JornadaHoraCreateSerializer(data=data)
        if serializer.is_valid():
            instance = JornadaHoraRepository.create(serializer.validated_data)
            return JornadaHoraDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = JornadaHoraRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Jornada no encontrada"}
        serializer = JornadaHoraCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = JornadaHoraRepository.update(instance, serializer.validated_data)
            return JornadaHoraDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = JornadaHoraRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Jornada no encontrada"}
        JornadaHoraRepository.delete(pk)
        return True, None

    @staticmethod
    def por_institucion(institucion_id):
        instances = JornadaHoraRepository.filter_by_institucion(institucion_id)
        return JornadaHoraListSerializer(instances, many=True).data
