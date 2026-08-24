from rest_framework import status
from rest_framework import status
from django.db import transaction
from ..models import PeriodoAcademico
from ..models.enums import PeriodoTipo
from ..repositories.anio_lectivo_repository import AnioLectivoRepository
from ..serializers.anio_lectivo_serializer import AnioLectivoSerializer, PeriodoAcademicoSerializer
from .distribucion_periodos import generar_periodos_data


class AnioLectivoService:
    @staticmethod
    def list_all(institucion_id=None):
        return AnioLectivoSerializer(AnioLectivoRepository.get_all(institucion_id), many=True).data

    @staticmethod
    def list_activos(institucion_id=None):
        return AnioLectivoSerializer(AnioLectivoRepository.get_activos(institucion_id), many=True).data

    @staticmethod
    def retrieve(pk, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return None
        return AnioLectivoSerializer(instance).data

    @staticmethod
    def get_periodos(anio_id, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(anio_id, institucion_id)
        if not instance:
            return []
        periodos = AnioLectivoRepository.get_periodos(anio_id)
        return PeriodoAcademicoSerializer(periodos, many=True).data

    @staticmethod
    def generar_periodos(pk, periodo_tipo, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        if periodo_tipo not in PeriodoTipo.values:
            return None, {'periodoTipo': 'Tipo de período inválido.'}, status.HTTP_400_BAD_REQUEST

        periodos_data = generar_periodos_data(instance.fechaInicio, periodo_tipo)
        with transaction.atomic():
            instance.periodos_academicos.all().delete()
            for periodo_data in periodos_data:
                PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
        return PeriodoAcademicoSerializer(
            AnioLectivoRepository.get_periodos(pk), many=True
        ).data, None, None

    @staticmethod
    def create(data, institucion_id=None):
        serializer = AnioLectivoSerializer(data=data)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', [])
            if institucion_id is not None:
                validated['institucion_id'] = institucion_id
            with transaction.atomic():
                instance = AnioLectivoRepository.create(validated)
                for periodo_data in periodos_data:
                    PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        serializer = AnioLectivoSerializer(instance, data=data, partial=False)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', None)
            if institucion_id is not None:
                validated['institucion_id'] = institucion_id
            with transaction.atomic():
                instance = AnioLectivoRepository.update(instance, validated)
                if periodos_data is not None:
                    instance.periodos_academicos.all().delete()
                    for periodo_data in periodos_data:
                        PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None, None
        return None, serializer.errors, None

    @staticmethod
    def partial_update(pk, data, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        serializer = AnioLectivoSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', None)
            if institucion_id is not None:
                validated['institucion_id'] = institucion_id
            with transaction.atomic():
                instance = AnioLectivoRepository.update(instance, validated)
                if periodos_data is not None:
                    instance.periodos_academicos.all().delete()
                    for periodo_data in periodos_data:
                        PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None, None
        return None, serializer.errors, None

    @staticmethod
    def delete(pk, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        AnioLectivoRepository.delete(pk)
        return None, None
