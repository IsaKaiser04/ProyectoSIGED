from django.db import transaction

from ..models import Distributivo
from ..repositories import DistributivoRepository


class DistributivoService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = Distributivo(**data)
            return DistributivoRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return DistributivoRepository.save(instance)