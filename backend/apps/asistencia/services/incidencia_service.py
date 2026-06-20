from apps.asistencia.models import Incidencia
from apps.asistencia.repositories.incidencia_repository import IncidenciaRepository
from apps.asistencia.serializers.incidencia_serializer import (
    IncidenciaListSerializer,
    IncidenciaDetailSerializer
)


class IncidenciaService:

    @staticmethod
    def list_all():
        instances = IncidenciaRepository.get_all()
        return IncidenciaListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = IncidenciaRepository.get_by_id(pk)
        if not instance:
            return None
        return IncidenciaDetailSerializer(instance).data

    @staticmethod
    def create(data, usuario):
        """Crear incidencia vinculada a una asistencia o matrícula."""
        from apps.asistencia.serializers.incidencia_serializer import IncidenciaDetailSerializer

        data['registrado_por'] = usuario

        # Si viene de una asistencia, vincular también la matrícula
        if data.get('asistencia'):
            asistencia = data['asistencia']
            if hasattr(asistencia, 'matricula_id'):
                data['matricula_id'] = asistencia.matricula_id

        instance = IncidenciaRepository.create(data)

        # Notificar si se solicitó
        if instance.notificar:
            IncidenciaService._disparar_notificacion(instance)

        # Si es grave, derivar a DECE
        if instance.tipo == 'COMPORTAMIENTO':
            IncidenciaService._verificar_derivacion_dece(instance)

        return IncidenciaDetailSerializer(instance).data, None

    @staticmethod
    def update(pk, data, usuario=None):
        instance = IncidenciaRepository.get_by_id(pk)
        if not instance:
            return None, None

        from apps.asistencia.serializers.incidencia_serializer import IncidenciaDetailSerializer
        IncidenciaRepository.update(instance, data)
        return IncidenciaDetailSerializer(IncidenciaRepository.get_by_id(pk)).data, None

    @staticmethod
    def delete(pk):
        instance = IncidenciaRepository.get_by_id(pk)
        if not instance:
            return False
        IncidenciaRepository.delete(instance)
        return True

    @staticmethod
    def por_asistencia(asistencia_id):
        instances = IncidenciaRepository.get_by_asistencia(asistencia_id)
        return IncidenciaListSerializer(instances, many=True).data

    @staticmethod
    def por_matricula(matricula_id):
        instances = IncidenciaRepository.get_by_matricula(matricula_id)
        return IncidenciaListSerializer(instances, many=True).data

    @staticmethod
    def por_periodo(matricula_id, fecha_inicio, fecha_fin):
        instances = IncidenciaRepository.get_by_periodo(matricula_id, fecha_inicio, fecha_fin)
        return IncidenciaListSerializer(instances, many=True).data

    @staticmethod
    def get_pendientes():
        instances = IncidenciaRepository.get_pendientes()
        return IncidenciaListSerializer(instances, many=True).data

    @staticmethod
    def _disparar_notificacion(incidencia):
        """NOTA: Integrar con módulo de notificaciones (RF-15)."""
        # TODO: from apps.notificaciones.services import NotificacionService
        pass

    @staticmethod
    def _verificar_derivacion_dece(incidencia):
        """NOTA: Si la incidencia es grave, derivar al módulo DECE."""
        # TODO: Lógica de umbrales para derivación automática
        pass
