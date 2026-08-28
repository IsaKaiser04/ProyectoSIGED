from rest_framework import status
from apps.matricula.repositories.matricula_periodo_repository import MatriculaPeriodoRepository
from apps.matricula.serializers.matricula_periodo_serializer import MatriculaPeriodoSerializer
from apps.matricula.models.enums import MatriculaPeriodoTipo
from apps.planificacion.models.anio_lectivo import AnioLectivo
from .reglas_calendario import calcular_fechas


class MatriculaPeriodoService:
    @staticmethod
    def list_all():
        return MatriculaPeriodoSerializer(MatriculaPeriodoRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        return MatriculaPeriodoSerializer(periodo).data if periodo else None

    @staticmethod
    def _fechas_automaticas(validated, periodo=None):
        anio_lectivo = validated.get('anio_lectivo') or getattr(periodo, 'anio_lectivo', None)
        if anio_lectivo is None:
            return None
        tipo = validated.get('tipo') or getattr(periodo, 'tipo', None) or MatriculaPeriodoTipo.ORDINARIA
        return calcular_fechas(tipo, anio_lectivo)

    @staticmethod
    def create(data):
        serializer = MatriculaPeriodoSerializer(data=data)
        if serializer.is_valid():
            validated = serializer.validated_data
            fechas = MatriculaPeriodoService._fechas_automaticas(validated)
            if fechas:
                validated.setdefault('fecha_inicio', fechas['fecha_inicio'])
                validated.setdefault('fecha_fin', fechas['fecha_fin'])
            if 'fecha_inicio' not in validated or 'fecha_fin' not in validated:
                return None, {
                    'fecha_inicio': ['Este campo es obligatorio.'],
                    'fecha_fin': ['Este campo es obligatorio.'],
                }
            instance = MatriculaPeriodoRepository.create(validated)
            return MatriculaPeriodoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        if not periodo:
            return None
        serializer = MatriculaPeriodoSerializer(periodo, data=data, partial=True)
        if serializer.is_valid():
            validated = serializer.validated_data
            fechas = MatriculaPeriodoService._fechas_automaticas(validated, periodo)
            if fechas:
                validated.setdefault('fecha_inicio', fechas['fecha_inicio'])
                validated.setdefault('fecha_fin', fechas['fecha_fin'])
            instance = MatriculaPeriodoRepository.update(periodo, validated)
            return MatriculaPeriodoSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def calcular(anio_lectivo_id, tipo):
        anio_lectivo = AnioLectivo.objects.filter(pk=anio_lectivo_id).first()
        if not anio_lectivo:
            return None, {'error': 'Año lectivo no encontrado'}, status.HTTP_404_NOT_FOUND
        fechas = calcular_fechas(tipo, anio_lectivo)
        if not fechas:
            return None, {'error': 'Tipo de período de matrícula inválido.'}, status.HTTP_400_BAD_REQUEST
        return fechas, None, None

    @staticmethod
    def delete(pk):
        periodo = MatriculaPeriodoRepository.get_by_id(pk)
        if not periodo:
            return False
        MatriculaPeriodoRepository.delete(periodo)
        return True
