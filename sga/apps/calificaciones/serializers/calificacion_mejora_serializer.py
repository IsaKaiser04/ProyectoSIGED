from rest_framework import serializers
from apps.calificaciones.models.calificacionMejora import CalificacionMejora
from apps.calificaciones.models.calificacionMejoraTipo import CalificacionMejoraTipo
from apps.calificaciones.models.calificacion import Calificacion

class CalificacionMejoraSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalificacionMejora
        fields = ['id', 'notaCuantitativa', 'notaCualitativa', 'observacion', 'calificacion', 'calificacion_mejora_tipo']

    def get_calificacion_mejora_tipo_label(self, obj):
        return obj.get_calificacion_mejora_tipo_display()

    def validate_calificacion_mejora_tipo(self, value):
        if value not in CalificacionMejoraTipo.values:
            raise serializers.ValidationError(f"'{value}' no es un tipo de evaluación válido.")
        return value
    
    def get_calificacion_label(self, value):
        if not Calificacion.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Calificación con id '{value.id}' no existe.")
        return value