from rest_framework import serializers

from ..models import AdaptacionCurricularPlanificacion


class AdaptacionCurricularPlanificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdaptacionCurricularPlanificacion
        fields = [
            'id',
            'adaptacion_curricular',
            'distributivo_asignatura_referencia',
            'archivo',
            'comentario',
            'estado',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_comentario(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El comentario no puede estar vacio.')
        return value