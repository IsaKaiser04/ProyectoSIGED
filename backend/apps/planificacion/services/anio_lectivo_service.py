from rest_framework import status
from django.db import transaction
from ..models import PeriodoAcademico
from ..models.anio_lectivo import AnioLectivo
from ..repositories.anio_lectivo_repository import AnioLectivoRepository
from ..serializers.anio_lectivo_serializer import AnioLectivoSerializer, PeriodoAcademicoSerializer


class AnioLectivoService:

    @staticmethod
    def _validar_superposicion_periodos(periodos_data, anio_inicio=None, anio_fin=None, periodo_ids_a_excluir=None):
        """
        Valida que ningún período se superponga en fechas con otro.
        También valida que todos los períodos estén dentro del rango del año lectivo.
        Retorna None si es válido, o un dict de errores si hay superposición.
        """
        if not periodos_data or len(periodos_data) < 2:
            return None

        periodo_ids_a_excluir = set(periodo_ids_a_excluir or [])

        ordenados = sorted(periodos_data, key=lambda p: p.get('fechaInicio'))
        for i in range(len(ordenados) - 1):
            actual = ordenados[i]
            siguiente = ordenados[i + 1]

            fin_actual = actual.get('fechaFin')
            inicio_siguiente = siguiente.get('fechaInicio')

            if fin_actual and inicio_siguiente and inicio_siguiente <= fin_actual:
                nombre_actual = actual.get('nombre', f'Período {i + 1}')
                nombre_siguiente = siguiente.get('nombre', f'Período {i + 2}')
                return {
                    'periodosAcademicos': (
                        f'El período "{nombre_siguiente}" (inicio: {inicio_siguiente}) '
                        f'se superpone con "{nombre_actual}" (fin: {fin_actual}). '
                        f'La fecha de inicio de un período debe ser estrictamente posterior a la fecha de fin del anterior.'
                    )
                }

        if anio_inicio and anio_fin:
            for i, p in enumerate(ordenados):
                fi = p.get('fechaInicio')
                ff = p.get('fechaFin')
                nombre = p.get('nombre', f'Período {i + 1}')
                if fi and fi < anio_inicio:
                    return {
                        'periodosAcademicos': (
                            f'El período "{nombre}" inicia ({fi}) antes del año lectivo ({anio_inicio}).'
                        )
                    }
                if ff and ff > anio_fin:
                    return {
                        'periodosAcademicos': (
                            f'El período "{nombre}" finaliza ({ff}) después del año lectivo ({anio_fin}).'
                        )
                    }

        return None

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
    def create(data, institucion_id=None):
        serializer = AnioLectivoSerializer(data=data)
        if serializer.is_valid():
            validated = serializer.validated_data
            periodos_data = validated.pop('periodosAcademicos', [])
            if institucion_id is not None:
                validated['institucion_id'] = institucion_id

            error_superposicion = AnioLectivoService._validar_superposicion_periodos(
                periodos_data,
                anio_inicio=validated.get('fechaInicio'),
                anio_fin=validated.get('fechaFin'),
            )
            if error_superposicion:
                return None, error_superposicion

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

            if periodos_data is not None:
                anio_inicio = validated.get('fechaInicio', instance.fechaInicio)
                anio_fin = validated.get('fechaFin', instance.fechaFin)
                error_superposicion = AnioLectivoService._validar_superposicion_periodos(
                    periodos_data, anio_inicio=anio_inicio, anio_fin=anio_fin,
                )
                if error_superposicion:
                    return None, error_superposicion, status.HTTP_400_BAD_REQUEST

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

            if periodos_data is not None:
                anio_inicio = validated.get('fechaInicio', instance.fechaInicio)
                anio_fin = validated.get('fechaFin', instance.fechaFin)
                error_superposicion = AnioLectivoService._validar_superposicion_periodos(
                    periodos_data, anio_inicio=anio_inicio, anio_fin=anio_fin,
                )
                if error_superposicion:
                    return None, error_superposicion, status.HTTP_400_BAD_REQUEST

            with transaction.atomic():
                instance = AnioLectivoRepository.update(instance, validated)
                if periodos_data is not None:
                    instance.periodos_academicos.all().delete()
                    for periodo_data in periodos_data:
                        PeriodoAcademico.objects.create(anioLectivo=instance, **periodo_data)
            return AnioLectivoSerializer(instance).data, None, None
        return None, serializer.errors, None

    @staticmethod
    def activate_exists(institucion_id=None):
        qs = AnioLectivoRepository.get_activos(institucion_id)
        return qs.exists()

    @staticmethod
    @transaction.atomic
    def activate(pk, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        AnioLectivo.objects.filter(
            institucion_id=institucion_id, estado='ACTIVO', eliminado=False
        ).exclude(id=pk).update(estado='INACTIVO')
        instance.estado = 'ACTIVO'
        instance.save()
        return AnioLectivoSerializer(instance).data, None

    @staticmethod
    def delete(pk, institucion_id=None):
        instance = AnioLectivoRepository.get_by_id(pk, institucion_id)
        if not instance:
            return {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        if instance.estado == 'ACTIVO':
            return {'error': 'No se puede eliminar un año lectivo activo. Desactívelo primero.'}, status.HTTP_400_BAD_REQUEST
        AnioLectivoRepository.soft_delete(pk)
        return None, None
