from rest_framework import serializers

from ..models import AdaptacionCurricular


class AdaptacionCurricularSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdaptacionCurricular
        fields = [
            'id',
            'matricula_referencia',
            'discapacidad_tipo',
            'discapacidad_grado',
            'necesidad_educativa',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_necesidad_educativa(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La necesidad educativa no puede estar vacia.')
        return value