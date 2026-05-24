from django.db import transaction

from ..models import PlanificacionCurricularHistorial
from ..repositories import PlanificacionCurricularHistorialRepository


class PlanificacionCurricularHistorialService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = PlanificacionCurricularHistorial(**data)
            return PlanificacionCurricularHistorialRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return PlanificacionCurricularHistorialRepository.save(instance)