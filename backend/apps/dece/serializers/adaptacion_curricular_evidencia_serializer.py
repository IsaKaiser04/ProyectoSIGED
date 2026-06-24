from rest_framework import serializers

from ..models import AdaptacionCurricularEvidencia


class AdaptacionCurricularEvidenciaSerializer(serializers.ModelSerializer):
    adaptacion_nombre = serializers.CharField(source='adaptacion_curricular.__str__', read_only=True)

    class Meta:
        model = AdaptacionCurricularEvidencia
        fields = [
            'id',
            'adaptacion_curricular',
            'adaptacion_nombre',
            'archivo',
            'descripcion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'adaptacion_nombre', 'created_at', 'updated_at']

    def validate_descripcion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La descripcion no puede estar vacia.')
        return value
