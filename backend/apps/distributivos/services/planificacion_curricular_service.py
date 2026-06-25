from django.db import transaction

from ..models import PlanificacionCurricular
from ..models.enums import PlanificacionEstado
from ..repositories import PlanificacionCurricularRepository, PlanificacionCurricularHistorialRepository
from ..serializers.planificacion_curricular_serializer import (
    PlanificacionCurricularListSerializer,
    PlanificacionCurricularDetailSerializer,
    PlanificacionCurricularCreateSerializer,
)


class PlanificacionCurricularService:
    @staticmethod
    def list_all():
        instances = PlanificacionCurricularRepository.get_all()
        return PlanificacionCurricularListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = PlanificacionCurricularRepository.get_con_historial(pk)
        if not instance:
            return None
        return PlanificacionCurricularDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = PlanificacionCurricularCreateSerializer(data=data)
        if serializer.is_valid():
            instance = PlanificacionCurricularRepository.create(serializer.validated_data)
            return PlanificacionCurricularDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = PlanificacionCurricularRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Planificación no encontrada"}
        serializer = PlanificacionCurricularCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = PlanificacionCurricularRepository.update(instance, serializer.validated_data)
            return PlanificacionCurricularDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = PlanificacionCurricularRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Planificación no encontrada"}
        PlanificacionCurricularRepository.delete(pk)
        return True, None

    @staticmethod
    @transaction.atomic
    def enviar_aprobacion(pk, observacion=""):
        instance = PlanificacionCurricularRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Planificación no encontrada"}
        if instance.estado != PlanificacionEstado.BORRADOR:
            return None, {"error": "Solo se puede enviar a aprobación desde estado Borrador."}

        estado_anterior = instance.estado
        instance.estado = PlanificacionEstado.POR_APROBAR
        PlanificacionCurricularRepository.update(instance, {'estado': instance.estado})

        PlanificacionCurricularHistorialRepository.create({
            'planificacion_curricular': instance,
            'estado_anterior': estado_anterior,
            'estado_actual': instance.estado,
            'observacion': observacion,
        })

        return PlanificacionCurricularDetailSerializer(
            PlanificacionCurricularRepository.get_con_historial(pk)
        ).data, None

    @staticmethod
    @transaction.atomic
    def aprobar(pk, observacion=""):
        instance = PlanificacionCurricularRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Planificación no encontrada"}
        if instance.estado != PlanificacionEstado.POR_APROBAR:
            return None, {"error": "Solo se puede aprobar una planificación en estado Por Aprobar."}

        estado_anterior = instance.estado
        instance.estado = PlanificacionEstado.APROBADO
        PlanificacionCurricularRepository.update(instance, {'estado': instance.estado})

        PlanificacionCurricularHistorialRepository.create({
            'planificacion_curricular': instance,
            'estado_anterior': estado_anterior,
            'estado_actual': instance.estado,
            'observacion': observacion,
        })

        return PlanificacionCurricularDetailSerializer(
            PlanificacionCurricularRepository.get_con_historial(pk)
        ).data, None
