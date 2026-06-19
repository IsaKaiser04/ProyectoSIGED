from rest_framework import serializers
from apps.calificaciones.models.evaluacionCriterio import EvaluacionCriterio
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica

class EvaluacionCriterioSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = EvaluacionCriterio
        fields = ['id','cuantitativaMinima','cuantitativaMaxima','cualitativa','descripcion','evaluacion_rubrica','evaluacion_equivalencia']

    def get_evaluacion_rubrica_label(self, obj):
        return obj.evaluacion_rubrica.nombre if obj.evaluacion_rubrica else None

    def validate_evaluacion_rubrica(self, value):
        if not EvaluacionRubrica.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Evaluación Rubrica con id '{value.id}' no existe.")
        return value
    
    def get_evaluacion_equivalencia_label(self, value):
        if not EvaluacionEquivalencia.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Evaluación Equivalencia con id '{value.id}' no existe.")
        return value