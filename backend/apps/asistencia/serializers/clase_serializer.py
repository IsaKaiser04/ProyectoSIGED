from rest_framework import serializers
from apps.asistencia.models import Clase, ClaseEstado
from apps.asistencia.serializers.asistencia_serializer import AsistenciaMinimalSerializer


class ClaseListSerializer(serializers.ModelSerializer):
    """Serializer para listados de clases."""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    total_asistencias = serializers.SerializerMethodField(read_only=True)
    total_inasistencias = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Clase
        fields = [
            'id', 'tema', 'fecha', 'hora_inicio', 'hora_fin',
            'estado', 'estado_display', 'distributivo_asignatura_id',
            'total_asistencias', 'total_inasistencias'
        ]

    def get_total_asistencias(self, obj):
        return obj.asistencias.filter(tipo='ASISTENCIA').count()

    def get_total_inasistencias(self, obj):
        return obj.asistencias.filter(tipo__in=['INASISTENCIA', 'JUSTIFICADO', 'ATRASADO']).count()


class ClaseDetailSerializer(serializers.ModelSerializer):
    """Serializer con asistencias anidadas."""
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    asistencias = AsistenciaMinimalSerializer(many=True, read_only=True)
    creado_por_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Clase
        fields = [
            'id', 'tema', 'descripcion', 'fecha', 'hora_inicio', 'hora_fin',
            'estado', 'estado_display', 'distributivo_asignatura_id',
            'horario_id', 'distributivo_evaluacion_id',
            'asistencias', 'creado_por', 'creado_por_nombre',
            'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = ['creado_por', 'fecha_creacion', 'fecha_modificacion']

    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.first_name} {obj.creado_por.last_name}".strip()
        return None


class ClaseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para crear/actualizar clases."""
    class Meta:
        model = Clase
        fields = [
            'tema', 'descripcion', 'fecha', 'hora_inicio', 'hora_fin',
            'estado', 'distributivo_asignatura_id', 'horario_id',
            'distributivo_evaluacion_id'
        ]


class ClaseEstadoSerializer(serializers.Serializer):
    """Serializer para cambiar estado de clase."""
    estado = serializers.ChoiceField(choices=ClaseEstado.choices)
