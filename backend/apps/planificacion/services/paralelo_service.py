from rest_framework import status
from django.db import transaction
from ..repositories.paralelo_repository import ParaleloRepository
from ..serializers.paralelo_serializer import ParaleloSerializer


class ParaleloService:
    @staticmethod
    def list_all():
        return ParaleloSerializer(ParaleloRepository.get_all(), many=True).data

    @staticmethod
    def por_grado_ofertado(grado_ofertado_id):
        return ParaleloSerializer(
            ParaleloRepository.get_by_grado_ofertado(grado_ofertado_id), many=True
        ).data

    @staticmethod
    def retrieve(pk):
        instance = ParaleloRepository.get_by_id(pk)
        if not instance:
            return None
        return ParaleloSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = ParaleloSerializer(data=data)
        if serializer.is_valid():
            with transaction.atomic():
                instance = ParaleloRepository.create(serializer.validated_data)
            return ParaleloSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = ParaleloRepository.get_by_id(pk)
        if not instance:
            return None, {'error': 'Paralelo no encontrado'}
        serializer = ParaleloSerializer(instance, data=data, partial=False)
        if serializer.is_valid():
            with transaction.atomic():
                instance = ParaleloRepository.update(instance, serializer.validated_data)
            return ParaleloSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def partial_update(pk, data):
        instance = ParaleloRepository.get_by_id(pk)
        if not instance:
            return None, {'error': 'Paralelo no encontrado'}
        serializer = ParaleloSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                instance = ParaleloRepository.update(instance, serializer.validated_data)
            return ParaleloSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = ParaleloRepository.get_by_id(pk)
        if not instance:
            return {'error': 'Paralelo no encontrado'}, status.HTTP_404_NOT_FOUND
        ParaleloRepository.delete(pk)
        return None, None
