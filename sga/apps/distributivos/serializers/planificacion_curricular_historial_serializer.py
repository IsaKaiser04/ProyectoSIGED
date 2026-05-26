from rest_framework import serializers

from ..models import PlanificacionCurricularHistorial


class PlanificacionCurricularHistorialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanificacionCurricularHistorial
        fields = [
            'id',
            'planificacion_curricular',
            'fecha',
            'estado_anterior',
            'estado_actual',
            'observacion',
        ]
        read_only_fields = ['id', 'fecha']