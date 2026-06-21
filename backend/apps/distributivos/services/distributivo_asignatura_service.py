from django.db import transaction

from ..models import DistributivoAsignatura
from ..repositories import DistributivoAsignaturaRepository


class DistributivoAsignaturaService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = DistributivoAsignatura(**data)
            return DistributivoAsignaturaRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return DistributivoAsignaturaRepository.save(instance)