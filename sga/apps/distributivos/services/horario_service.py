from django.db import transaction

from ..models import Horario
from ..repositories import HorarioRepository


class HorarioService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = Horario(**data)
            return HorarioRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return HorarioRepository.save(instance)