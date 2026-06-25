from django.db import transaction

from ..models import AdaptacionCurricularEvidencia
from ..repositories import AdaptacionCurricularEvidenciaRepository


class AdaptacionCurricularEvidenciaService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = AdaptacionCurricularEvidencia(**data)
            return AdaptacionCurricularEvidenciaRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return AdaptacionCurricularEvidenciaRepository.save(instance)
