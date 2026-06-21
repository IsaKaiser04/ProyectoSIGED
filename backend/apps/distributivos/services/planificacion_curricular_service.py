from django.db import transaction

from ..models import PlanificacionCurricular
from ..repositories import PlanificacionCurricularRepository


class PlanificacionCurricularService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = PlanificacionCurricular(**data)
            return PlanificacionCurricularRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return PlanificacionCurricularRepository.save(instance)