from rest_framework import serializers

from ..models import PlanificacionCurricularHistorial


class PlanificacionCurricularHistorialListSerializer(serializers.ModelSerializer):
    estado_anterior_display = serializers.CharField(source='get_estado_anterior_display', read_only=True)
    estado_actual_display = serializers.CharField(source='get_estado_actual_display', read_only=True)

    class Meta:
        model = PlanificacionCurricularHistorial
        fields = [
            'id', 'planificacion_curricular', 'fecha',
            'estado_anterior', 'estado_anterior_display',
            'estado_actual', 'estado_actual_display',
            'observacion',
        ]
        read_only_fields = ['id', 'fecha']


class PlanificacionCurricularHistorialCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanificacionCurricularHistorial
        fields = ['planificacion_curricular', 'estado_anterior', 'estado_actual', 'observacion']
