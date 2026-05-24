from rest_framework import serializers

from ..models import PlanificacionCurricular


class PlanificacionCurricularSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanificacionCurricular
        fields = [
            'id',
            'distributivo_asignatura',
            'archivo_pdf',
            'observacion',
            'estado',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_archivo_pdf(self, value):
        if value and not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('El archivo debe tener extension PDF.')
        return value