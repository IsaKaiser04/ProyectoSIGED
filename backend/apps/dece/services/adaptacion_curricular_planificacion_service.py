from django.db import transaction

from ..models import AdaptacionCurricularPlanificacion
from ..repositories import AdaptacionCurricularPlanificacionRepository


class AdaptacionCurricularPlanificacionService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = AdaptacionCurricularPlanificacion(**data)
            return AdaptacionCurricularPlanificacionRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return AdaptacionCurricularPlanificacionRepository.save(instance)
