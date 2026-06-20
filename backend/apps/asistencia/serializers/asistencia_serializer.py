from rest_framework import serializers
from apps.asistencia.models import Asistencia, AsistenciaTipo


class AsistenciaMinimalSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados y relaciones."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Asistencia
        fields = ['id', 'tipo', 'tipo_display', 'observacion', 'notificar']


class AsistenciaSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle y creación."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    matricula_id = serializers.IntegerField(write_only=True)
    clase_id = serializers.IntegerField(write_only=True)
    registrado_por_nombre = serializers.SerializerMethodField(read_only=True)
    fecha_registro = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    tiene_incidencia = serializers.SerializerMethodField(read_only=True)
    tiene_justificacion = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Asistencia
        fields = [
            'id', 'tipo', 'tipo_display', 'observacion', 'notificar',
            'clase_id', 'matricula_id',
            'registrado_por', 'registrado_por_nombre',
            'fecha_registro', 'fecha_modificacion',
            'tiene_incidencia', 'tiene_justificacion'
        ]
        read_only_fields = ['registrado_por', 'fecha_registro', 'fecha_modificacion']

    def get_registrado_por_nombre(self, obj):
        if obj.registrado_por:
            return f"{obj.registrado_por.first_name} {obj.registrado_por.last_name}".strip()
        return None

    def get_tiene_incidencia(self, obj):
        return obj.incidencias.exists()

    def get_tiene_justificacion(self, obj):
        return obj.justificaciones.exists()


class AsistenciaMasivaSerializer(serializers.Serializer):
    """Serializer para marcado masivo de asistencia."""
    clase_id = serializers.IntegerField()
    asistencias = serializers.ListField(
        child=serializers.DictField(),
        help_text='Lista de dicts: [{"matricula_id": 1, "tipo": "ASISTENCIA", "observacion": ""}]'
    )
    notificar = serializers.BooleanField(default=False)

    def validate_asistencias(self, value):
        if not value:
            raise serializers.ValidationError("Debe enviar al menos un registro de asistencia.")
        tipos_validos = [t[0] for t in AsistenciaTipo.choices]
        for item in value:
            if 'matricula_id' not in item:
                raise serializers.ValidationError("Cada registro debe tener 'matricula_id'.")
            if 'tipo' not in item:
                raise serializers.ValidationError("Cada registro debe tener 'tipo'.")
            if item['tipo'] not in tipos_validos:
                raise serializers.ValidationError(f"Tipo '{item['tipo']}' no es válido.")
        return value


class AsistenciaUpdateTipoSerializer(serializers.Serializer):
    """Serializer para cambiar solo el tipo de asistencia."""
    tipo = serializers.ChoiceField(choices=AsistenciaTipo.choices)
    observacion = serializers.CharField(required=False, allow_blank=True, default='')
    notificar = serializers.BooleanField(required=False, default=False)
