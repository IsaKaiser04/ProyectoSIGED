from django.db import transaction

from ..models import JornadaHora
from ..repositories import JornadaHoraRepository


class JornadaHoraService:
    @staticmethod
    def create(data):
        with transaction.atomic():
            instance = JornadaHora(**data)
            return JornadaHoraRepository.save(instance)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        with transaction.atomic():
            return JornadaHoraRepository.save(instance)