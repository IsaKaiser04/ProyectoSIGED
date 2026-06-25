from rest_framework import serializers

from ..models import AdaptacionCurricularPlanificacion


class AdaptacionCurricularPlanificacionSerializer(serializers.ModelSerializer):
    adaptacion_nombre = serializers.CharField(source='adaptacion_curricular.__str__', read_only=True)
    distributivo_asignatura_nombre = serializers.CharField(source='distributivo_asignatura.__str__', read_only=True)

    class Meta:
        model = AdaptacionCurricularPlanificacion
        fields = [
            'id',
            'adaptacion_curricular',
            'adaptacion_nombre',
            'distributivo_asignatura',
            'distributivo_asignatura_nombre',
            'archivo',
            'comentario',
            'estado',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'adaptacion_nombre', 'distributivo_asignatura_nombre', 'created_at', 'updated_at']

    def validate_comentario(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('El comentario no puede estar vacio.')
        return value
