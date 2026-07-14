from rest_framework import serializers

from ..models import PlanificacionCurricular


class PlanificacionCurricularListSerializer(serializers.ModelSerializer):
    asignatura_nombre = serializers.CharField(
        source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True
    )
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = PlanificacionCurricular
        fields = [
            'id', 'distributivo_asignatura', 'asignatura_nombre',
            'archivo_pdf', 'observacion', 'estado', 'estado_display',
        ]


class PlanificacionCurricularDetailSerializer(serializers.ModelSerializer):
    asignatura_nombre = serializers.CharField(
        source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True
    )
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    historiales = serializers.SerializerMethodField(read_only=True)
    ####
    extra_kwargs = {
            'archivo_pdf': {'required': False, 'allow_null': True}
    }

    class Meta:
        model = PlanificacionCurricular
        fields = [
            'id', 'distributivo_asignatura', 'asignatura_nombre',
            'archivo_pdf', 'observacion', 'estado', 'estado_display',
            'created_at', 'updated_at', 'historiales',
        ]
        read_only_fields = ['id', 'asignatura_nombre', 'estado_display', 'created_at', 'updated_at']

    def get_historiales(self, obj):
        from ..serializers.planificacion_curricular_historial_serializer import (
            PlanificacionCurricularHistorialListSerializer
        )
        return PlanificacionCurricularHistorialListSerializer(
            obj.historiales.all(), many=True
        ).data


class PlanificacionCurricularCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanificacionCurricular
        fields = ['distributivo_asignatura', 'archivo_pdf', 'observacion', 'estado']

    def validate_archivo_pdf(self, value):
        if value and not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('El archivo debe tener extensión PDF.')
        return value
