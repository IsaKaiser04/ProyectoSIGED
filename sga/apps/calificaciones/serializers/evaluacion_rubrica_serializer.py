from rest_framework import serializers
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.models.evaluacionTipo import EvaluacionTipo

class EvaluacionRubricaSerializer(serializers.ModelSerializer):

    class Meta:
        model = EvaluacionRubrica
        fields = ['id', 'nombre', 'institucion_id', 'esActivo', 'evaluacion_tipo']

    def get_evaluacion_tipo_label(self, obj):
        return obj.get_evaluacion_tipo_display()

    def validate_evaluacion_tipo(self, value):
        if value not in EvaluacionTipo.values:
            raise serializers.ValidationError(f"'{value}' no es un tipo de evaluación válido.")
        return value