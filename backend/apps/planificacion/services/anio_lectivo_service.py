from rest_framework import status
from django.db import transaction
from ..models import PeriodoAcademico
from ..repositories.anio_lectivo_repository import AnioLectivoRepository
from ..serializers.anio_lectivo_serializer import AnioLectivoSerializer, PeriodoAcademicoSerializer


class AnioLectivoService:
    @staticmethod
    def list_all():
        return AnioLectivoSerializer(AnioLectivoRepository.get_all(), many=True).data

    @staticmethod
    def list_activos():
        return AnioLectivoSerializer(AnioLectivoRepository.get_activos(), many=True).data

    @staticmethod
    def retrieve(pk):
        instance = AnioLectivoRepository.get_by_id(pk)
        if not instance:
            return None
        return AnioLectivoSerializer(instance).data

    @staticmethod
    def get_periodos(anio_id):
        periodos = AnioLectivoRepository.get_periodos(anio_id)
        return PeriodoAcademicoSerializer(periodos, many=True).data

    @staticmethod
    def create(data):
        serializer = AnioLectivoSerializer(data=data)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', [])
            with transaction.atomic():
                instance = AnioLectivoRepository.create(validated)
                for periodo_data in periodos_data:
                    PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = AnioLectivoRepository.get_by_id(pk)
        if not instance:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        serializer = AnioLectivoSerializer(instance, data=data, partial=False)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', None)
            with transaction.atomic():
                instance = AnioLectivoRepository.update(instance, validated)
                if periodos_data is not None:
                    instance.periodos_academicos.all().delete()
                    for periodo_data in periodos_data:
                        PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None, None
        return None, serializer.errors, None

    @staticmethod
    def partial_update(pk, data):
        instance = AnioLectivoRepository.get_by_id(pk)
        if not instance:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        serializer = AnioLectivoSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', None)
            with transaction.atomic():
                instance = AnioLectivoRepository.update(instance, validated)
                if periodos_data is not None:
                    instance.periodos_academicos.all().delete()
                    for periodo_data in periodos_data:
                        PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None, None
        return None, serializer.errors, None

    @staticmethod
    def delete(pk):
        instance = AnioLectivoRepository.get_by_id(pk)
        if not instance:
            return {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        AnioLectivoRepository.delete(pk)
        return None, None
