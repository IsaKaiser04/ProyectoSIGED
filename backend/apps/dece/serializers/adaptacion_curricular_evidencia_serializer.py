from rest_framework import serializers

from ..models import AdaptacionCurricularEvidencia


class AdaptacionCurricularEvidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdaptacionCurricularEvidencia
        fields = [
            'id',
            'adaptacion_curricular',
            'archivo',
            'descripcion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_descripcion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La descripcion no puede estar vacia.')
        return value