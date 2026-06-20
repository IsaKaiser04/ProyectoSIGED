from rest_framework import serializers
from apps.asistencia.models import Justificacion, JustificacionEstado


class JustificacionListSerializer(serializers.ModelSerializer):
    """Serializer para listados (vista de secretaría)."""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    estudiante_info = serializers.SerializerMethodField(read_only=True)
    clase_info = serializers.SerializerMethodField(read_only=True)
    fecha_solicitud = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')

    class Meta:
        model = Justificacion
        fields = [
            'id', 'estado', 'estado_display', 'motivo',
            'asistencia', 'estudiante_info', 'clase_info',
            'solicitado_por', 'fecha_solicitud', 'fecha_resolucion'
        ]

    def get_estudiante_info(self, obj):
        try:
            matricula = obj.asistencia.matricula
            return {
                'matricula_id': matricula.id,
                'estudiante_nombre': str(matricula.estudiante) if hasattr(matricula, 'estudiante') else str(matricula)
            }
        except Exception:
            return {'matricula_id': obj.asistencia.matricula_id, 'estudiante_nombre': 'N/A'}

    def get_clase_info(self, obj):
        try:
            clase = obj.asistencia.clase
            return {
                'clase_id': clase.id,
                'tema': clase.tema,
                'fecha': str(clase.fecha)
            }
        except Exception:
            return {'clase_id': obj.asistencia.clase_id, 'tema': 'N/A', 'fecha': 'N/A'}


class JustificacionCreateSerializer(serializers.ModelSerializer):
    """Serializer para que el representante cree una justificación."""
    asistencia_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Justificacion
        fields = ['asistencia_id', 'motivo', 'archivo']
        extra_kwargs = {
            'motivo': {'required': True, 'allow_blank': False},
            'archivo': {'required': True, 'allow_null': False}
        }

    def validate_archivo(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no debe superar los 5MB.")
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
                raise serializers.ValidationError("Solo se permiten archivos PDF o imágenes.")
        return value


class JustificacionResolucionSerializer(serializers.Serializer):
    """Serializer para que secretaría apruebe/rechace."""
    estado = serializers.ChoiceField(choices=[
        (JustificacionEstado.APROBADA, 'Aprobada'),
        (JustificacionEstado.RECHAZADA, 'Rechazada')
    ])
    observacion_secretaria = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_observacion_secretaria(self, value):
        if self.initial_data.get('estado') == JustificacionEstado.RECHAZADA and not value:
            raise serializers.ValidationError("Debe indicar el motivo del rechazo.")
        return value
