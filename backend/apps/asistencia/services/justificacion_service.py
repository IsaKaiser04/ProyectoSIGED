from datetime import datetime
from django.db import transaction
from apps.asistencia.models import Justificacion, JustificacionEstado, AsistenciaTipo
from apps.asistencia.repositories.justificacion_repository import JustificacionRepository
from apps.asistencia.repositories.asistencia_repository import AsistenciaRepository
from apps.asistencia.serializers.justificacion_serializer import (
    JustificacionListSerializer,
    JustificacionCreateSerializer,
    JustificacionResolucionSerializer
)


class JustificacionService:

    @staticmethod
    def list_all():
        """Listar todas las justificaciones (admin/secretaría)."""
        instances = JustificacionRepository.get_all()
        return JustificacionListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = JustificacionRepository.get_by_id(pk)
        if not instance:
            return None
        return JustificacionListSerializer(instance).data

    @staticmethod
    def get_pendientes():
        """Obtener justificaciones pendientes de resolución (para secretaría)."""
        instances = JustificacionRepository.get_pendientes()
        return JustificacionListSerializer(instances, many=True).data

    @staticmethod
    def por_matricula(matricula_id):
        """Obtener historial de justificaciones de un estudiante."""
        instances = JustificacionRepository.get_by_matricula(matricula_id)
        return JustificacionListSerializer(instances, many=True).data

    @staticmethod
    def crear_solicitud(data, usuario):
        """El representante crea una solicitud de justificación.
        
        Validaciones:
        - La asistencia debe existir y estar en estado INASISTENCIA
        - No debe existir ya una justificación PENDIENTE o APROBADA para esa asistencia
        - El archivo es obligatorio
        """
        serializer = JustificacionCreateSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors

        validated = serializer.validated_data
        asistencia_id = validated['asistencia_id']

        # Validar que la asistencia existe
        asistencia = AsistenciaRepository.get_by_id(asistencia_id)
        if not asistencia:
            return None, {'error': 'La asistencia especificada no existe.'}

        # Validar que esté en estado INASISTENCIA
        if asistencia.tipo != AsistenciaTipo.INASISTENCIA:
            return None, {'error': f'Solo se pueden justificar faltas (INASISTENCIA). Estado actual: {asistencia.tipo}'}

        # Validar que no exista justificación pendiente/aprobada
        existentes = JustificacionRepository.get_by_asistencia(asistencia_id)
        for ex in existentes:
            if ex.estado in [JustificacionEstado.PENDIENTE, JustificacionEstado.APROBADA]:
                return None, {'error': 'Ya existe una justificación pendiente o aprobada para esta asistencia.'}

        # Crear la justificación
        justificacion_data = {
            'asistencia_id': asistencia_id,
            'motivo': validated['motivo'],
            'archivo': validated['archivo'],
            'estado': JustificacionEstado.PENDIENTE,
            'solicitado_por': usuario
        }

        instance = JustificacionRepository.create(justificacion_data)
        return JustificacionListSerializer(instance).data, None

    @staticmethod
    @transaction.atomic
    def resolver(pk, data, usuario):
        """La secretaría aprueba o rechaza una justificación.
        
        Si APRUEBA: Cambia el estado de la asistencia a JUSTIFICADO.
        Si RECHAZA: Mantiene INASISTENCIA, guarda observación.
        """
        instance = JustificacionRepository.get_by_id(pk)
        if not instance:
            return None, None

        # Validar que esté pendiente
        if instance.estado != JustificacionEstado.PENDIENTE:
            return None, {'error': f'La justificación ya fue resuelta. Estado actual: {instance.estado}'}

        serializer = JustificacionResolucionSerializer(data=data)
        if not serializer.is_valid():
            return None, serializer.errors

        validated = serializer.validated_data
        nuevo_estado = validated['estado']
        observacion = validated.get('observacion_secretaria', '')

        # Actualizar justificación
        JustificacionRepository.update(instance, {
            'estado': nuevo_estado,
            'observacion_secretaria': observacion,
            'resuelto_por': usuario,
            'fecha_resolucion': datetime.now()
        })

        # Si se aprobó, cambiar estado de asistencia
        if nuevo_estado == JustificacionEstado.APROBADA:
            asistencia = instance.asistencia
            AsistenciaRepository.update(asistencia, {
                'tipo': AsistenciaTipo.JUSTIFICADO
            })

        return JustificacionListSerializer(JustificacionRepository.get_by_id(pk)).data, None

    @staticmethod
    def delete(pk):
        """Eliminar una justificación (solo si está pendiente)."""
        instance = JustificacionRepository.get_by_id(pk)
        if not instance:
            return False
        if instance.estado != JustificacionEstado.PENDIENTE:
            return False
        JustificacionRepository.delete(instance)
        return True
