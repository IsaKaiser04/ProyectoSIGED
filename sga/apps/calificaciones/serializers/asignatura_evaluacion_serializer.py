from rest_framework import serializers
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.promedioCategoria import PromedioCategoria

class AsignaturaEvaluacionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AsignaturaEvaluacion
        fields = ['id', 'distributivo_asignatura_id', 'evaluacion_categoria', 'promedio_categoria']

    def get_evaluacion_categoria_label(self, value):
        if not EvaluacionCategoria.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Evaluación de categoría con id '{value.id}' no existe.")
        return value
    
    def get_promedio_categoria_label(self, value):
        if not PromedioCategoria.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Promedio de categoría con id '{value.id}' no existe.")
        return value