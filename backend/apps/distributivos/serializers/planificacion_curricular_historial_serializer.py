from rest_framework import serializers

from ..models import PlanificacionCurricularHistorial


class PlanificacionCurricularHistorialSerializer(serializers.ModelSerializer):
    planificacion_nombre = serializers.CharField(
        source='planificacion_curricular.distributivo_asignatura.asignatura_ofertada.nombre',
        read_only=True
    )

    class Meta:
        model = PlanificacionCurricularHistorial
        fields = [
            'id',
            'planificacion_curricular',
            'planificacion_nombre',
            'fecha',
            'estado_anterior',
            'estado_actual',
            'observacion',
        ]
        read_only_fields = ['id', 'planificacion_nombre', 'fecha']
