from datetime import datetime, date
from django.db import transaction
from apps.asistencia.models import Asistencia, AsistenciaTipo
from apps.asistencia.repositories.asistencia_repository import AsistenciaRepository
from apps.asistencia.serializers.asistencia_serializer import (
    AsistenciaSerializer,
    AsistenciaMasivaSerializer,
    AsistenciaUpdateTipoSerializer
)


class AsistenciaService:

    @staticmethod
    def list_all():
        """Listar todas las asistencias (solo admin)."""
        instances = AsistenciaRepository.get_all()
        return AsistenciaSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = AsistenciaRepository.get_by_id(pk)
        if not instance:
            return None
        return AsistenciaSerializer(instance).data

    @staticmethod
    def por_clase(clase_id):
        """Obtener asistencias de una clase específica."""
        instances = AsistenciaRepository.get_by_clase(clase_id)
        return AsistenciaSerializer(instances, many=True).data

    @staticmethod
    def por_matricula(matricula_id):
        """Obtener historial de asistencia de un estudiante."""
        instances = AsistenciaRepository.get_by_matricula(matricula_id)
        return AsistenciaSerializer(instances, many=True).data

    @staticmethod
    def por_matricula_periodo(matricula_id, fecha_inicio, fecha_fin):
        """Obtener asistencias de un estudiante en un rango de fechas."""
        instances = AsistenciaRepository.get_by_matricula_y_periodo(
            matricula_id, fecha_inicio, fecha_fin
        )
        return AsistenciaSerializer(instances, many=True).data

    @staticmethod
    def create(data, usuario):
        """Crear un registro individual de asistencia."""
        # Validar que no exista ya
        if AsistenciaRepository.existe_registro(data['clase_id'], data['matricula_id']):
            return None, {'error': 'Ya existe un registro de asistencia para este alumno en esta clase.'}

        data['registrado_por'] = usuario
        instance = AsistenciaRepository.create(data)

        # Si se marcó como inasistencia y se pidió notificar, se maneja vía señal o aquí
        if instance.tipo == AsistenciaTipo.INASISTENCIA and instance.notificar:
            AsistenciaService._disparar_notificacion_inasistencia(instance)

        return AsistenciaSerializer(instance).data, None

    @staticmethod
    @transaction.atomic
    def create_masiva(data, usuario):
        """Registro masivo de asistencia para una clase completa.
        
        Flujo típico: El docente envía lista de alumnos con sus estados.
        El sistema crea o actualiza los registros.
        """
        serializer = AsistenciaMasivaSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors

        validated = serializer.validated_data
        clase_id = validated['clase_id']
        asistencias_data = validated['asistencias']
        notificar_global = validated.get('notificar', False)

        resultados = []
        errores = []

        for item in asistencias_data:
            matricula_id = item['matricula_id']
            tipo = item['tipo']
            observacion = item.get('observacion', '')

            registro_data = {
                'clase_id': clase_id,
                'matricula_id': matricula_id,
                'tipo': tipo,
                'observacion': observacion,
                'notificar': notificar_global or tipo == AsistenciaTipo.INASISTENCIA,
                'registrado_por': usuario
            }

            existente = AsistenciaRepository.get_by_clase_y_matricula(clase_id, matricula_id)

            if existente:
                AsistenciaRepository.update(existente, {
                    'tipo': tipo,
                    'observacion': observacion,
                    'notificar': registro_data['notificar'],
                    'registrado_por': usuario
                })
                resultados.append(AsistenciaSerializer(existente).data)
            else:
                nuevo = AsistenciaRepository.create(registro_data)
                resultados.append(AsistenciaSerializer(nuevo).data)

        return {
            'mensaje': f'Se procesaron {len(resultados)} registros.',
            'total': len(resultados),
            'asistencias': resultados
        }, None

    @staticmethod
    def update_tipo(pk, data, usuario):
        """Actualizar solo el tipo de una asistencia (clic en cuadrícula)."""
        instance = AsistenciaRepository.get_by_id(pk)
        if not instance:
            return None, None

        serializer = AsistenciaUpdateTipoSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors

        validated = serializer.validated_data
        AsistenciaRepository.update(instance, {
            'tipo': validated['tipo'],
            'observacion': validated.get('observacion', instance.observacion),
            'notificar': validated.get('notificar', instance.notificar),
            'registrado_por': usuario
        })

        # Notificar si cambia a inasistencia
        if validated['tipo'] == AsistenciaTipo.INASISTENCIA and validated.get('notificar', False):
            AsistenciaService._disparar_notificacion_inasistencia(instance)

        return AsistenciaSerializer(AsistenciaRepository.get_by_id(pk)).data, None

    @staticmethod
    def delete(pk):
        instance = AsistenciaRepository.get_by_id(pk)
        if not instance:
            return False
        AsistenciaRepository.delete(instance)
        return True

    @staticmethod
    def get_estadisticas_clase(clase_id):
        """Obtener resumen de asistencia para una clase."""
        stats = AsistenciaRepository.get_estadisticas_por_clase(clase_id)
        resultado = {
            'ASISTENCIA': 0,
            'INASISTENCIA': 0,
            'JUSTIFICADO': 0,
            'ATRASADO': 0,
            'total': 0
        }
        for stat in stats:
            resultado[stat['tipo']] = stat['total']
            resultado['total'] += stat['total']
        return resultado

    @staticmethod
    def get_pendientes_docente(distributivo_id, fecha):
        """Obtener clases sin asistencia para un docente."""
        clases = AsistenciaRepository.get_pendientes_por_docente(distributivo_id, fecha)
        from apps.asistencia.serializers.clase_serializer import ClaseListSerializer
        return ClaseListSerializer(clases, many=True).data

    @staticmethod
    def _disparar_notificacion_inasistencia(asistencia):
        """Disparar notificación al representante.
        
        NOTA: Aquí se integraría con el módulo de notificaciones.
        Por ahora solo se marca el flag. Cuando ese módulo esté listo,
        se envía la alerta (RF-13).
        """
        # TODO: Integrar con módulo de notificaciones
        # from apps.notificaciones.services import NotificacionService
        # NotificacionService.crear_alerta_inasistencia(asistencia)
        pass
