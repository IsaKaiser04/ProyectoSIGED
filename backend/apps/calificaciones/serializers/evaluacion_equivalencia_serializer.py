from rest_framework import serializers
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica

class EvaluacionEquivalenciaSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = EvaluacionEquivalencia
        fields = ['id', 'nombre', 'descripcion', 'evaluacion_rubrica']

    def get_evaluacion_rubrica_label(self, obj):
        return obj.evaluacion_rubrica.nombre if obj.evaluacion_rubrica else None

    def validate_evaluacion_rubrica(self, value):
        if not EvaluacionRubrica.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Evaluación Rubrica con id '{value.id}' no existe.")
        return value