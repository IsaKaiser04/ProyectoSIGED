from ..repositories import PlanificacionCurricularHistorialRepository
from ..serializers.planificacion_curricular_historial_serializer import (
    PlanificacionCurricularHistorialListSerializer,
)


class PlanificacionCurricularHistorialService:
    @staticmethod
    def list_all():
        instances = PlanificacionCurricularHistorialRepository.get_all()
        return PlanificacionCurricularHistorialListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = PlanificacionCurricularHistorialRepository.get_by_id(pk)
        if not instance:
            return None
        return PlanificacionCurricularHistorialListSerializer(instance).data

    @staticmethod
    def por_planificacion(planificacion_id):
        instances = PlanificacionCurricularHistorialRepository.filter_by_planificacion(planificacion_id)
        return PlanificacionCurricularHistorialListSerializer(instances, many=True).data
