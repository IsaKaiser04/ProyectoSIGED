from django.db import transaction

from ..models import AdaptacionCurricular
from ..repositories import AdaptacionCurricularRepository


class AdaptacionCurricularService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = AdaptacionCurricular(**data)
            return AdaptacionCurricularRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return AdaptacionCurricularRepository.save(instance)
