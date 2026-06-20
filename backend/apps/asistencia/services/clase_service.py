from datetime import timedelta
from apps.asistencia.models import Clase, ClaseEstado
from apps.asistencia.repositories.clase_repository import ClaseRepository
from apps.asistencia.serializers.clase_serializer import (
    ClaseListSerializer,
    ClaseDetailSerializer,
    ClaseCreateUpdateSerializer
)


class ClaseService:

    @staticmethod
    def list_all():
        instances = ClaseRepository.get_all()
        return ClaseListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = ClaseRepository.get_con_asistencias(pk)
        if not instance:
            return None
        return ClaseDetailSerializer(instance).data

    @staticmethod
    def create(data, usuario):
        serializer = ClaseCreateUpdateSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors

        validated = serializer.validated_data
        validated['creado_por'] = usuario
        instance = ClaseRepository.create(validated)
        return ClaseListSerializer(instance).data, None

    @staticmethod
    def update(pk, data, usuario=None):
        instance = ClaseRepository.get_by_id(pk)
        if not instance:
            return None, None

        serializer = ClaseCreateUpdateSerializer(instance, data=data, partial=True)
        if not serializer.is_valid():
            return None, serializer.errors

        ClaseRepository.update(instance, serializer.validated_data)
        return ClaseListSerializer(ClaseRepository.get_by_id(pk)).data, None

    @staticmethod
    def delete(pk):
        instance = ClaseRepository.get_by_id(pk)
        if not instance:
            return False
        ClaseRepository.delete(instance)
        return True

    @staticmethod
    def iniciar(pk):
        """Cambiar estado a EN_CURSO."""
        instance = ClaseRepository.get_by_id(pk)
        if not instance:
            return None, None
        if instance.estado != ClaseEstado.PROGRAMADO:
            return None, {'error': f'La clase debe estar en estado PROGRAMADO para iniciar. Estado actual: {instance.estado}'}
        ClaseRepository.cambiar_estado(pk, ClaseEstado.EN_CURSO)
        return ClaseListSerializer(ClaseRepository.get_by_id(pk)).data, None

    @staticmethod
    def finalizar(pk):
        """Cambiar estado a FINALIZADO."""
        instance = ClaseRepository.get_by_id(pk)
        if not instance:
            return None, None
        if instance.estado != ClaseEstado.EN_CURSO:
            return None, {'error': f'La clase debe estar en curso para finalizar. Estado actual: {instance.estado}'}
        ClaseRepository.cambiar_estado(pk, ClaseEstado.FINALIZADO)
        return ClaseListSerializer(ClaseRepository.get_by_id(pk)).data, None

    @staticmethod
    def cancelar(pk):
        """Cambiar estado a CANCELADO."""
        instance = ClaseRepository.get_by_id(pk)
        if not instance:
            return None, None
        ClaseRepository.cambiar_estado(pk, ClaseEstado.CANCELADO)
        return ClaseListSerializer(ClaseRepository.get_by_id(pk)).data, None

    @staticmethod
    def por_distributivo(distributivo_id):
        instances = ClaseRepository.get_by_distributivo(distributivo_id)
        return ClaseListSerializer(instances, many=True).data

    @staticmethod
    def por_estado(estado):
        instances = ClaseRepository.get_by_estado(estado)
        return ClaseListSerializer(instances, many=True).data

    @staticmethod
    def get_semana(distributivo_id, fecha_base):
        """Obtener clases de la semana que contiene fecha_base."""
        # Calcular lunes y domingo de la semana
        fecha = fecha_base if isinstance(fecha_base, type(fecha_base)) else fecha_base
        dia_semana = fecha.weekday()
        lunes = fecha - timedelta(days=dia_semana)
        domingo = lunes + timedelta(days=6)

        instances = ClaseRepository.get_clases_semana(distributivo_id, lunes, domingo)
        return ClaseListSerializer(instances, many=True).data

    @staticmethod
    def get_asistencias(pk):
        """Obtener una clase con sus asistencias."""
        instance = ClaseRepository.get_con_asistencias(pk)
        if not instance:
            return None
        return ClaseDetailSerializer(instance).data
