from rest_framework import serializers

from ..models import AdaptacionCurricular


class AdaptacionCurricularSerializer(serializers.ModelSerializer):
    matricula_nombre = serializers.CharField(source='matricula.__str__', read_only=True)

    class Meta:
        model = AdaptacionCurricular
        fields = [
            'id',
            'matricula',
            'matricula_nombre',
            'discapacidad_tipo',
            'discapacidad_grado',
            'necesidad_educativa',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'matricula_nombre', 'created_at', 'updated_at']

    def validate_necesidad_educativa(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('La necesidad educativa no puede estar vacia.')
        return value
