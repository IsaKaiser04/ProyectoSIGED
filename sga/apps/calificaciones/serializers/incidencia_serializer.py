from rest_framework import serializers
from apps.calificaciones.models.incidencia import Incidencia
from apps.calificaciones.models.incidenciaTipo import IncidenciaTipo
from apps.calificaciones.models.calificacion import Calificacion

class IncidenciaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Incidencia
        fields = ['id', 'asunto', 'detalle', 'archivo', 'notificar', 'incidencia_tipo', 'calificacion']

    def get_incidencia_tipo_label(self, obj):
        return obj.get_incidencia_tipo_display()

    def validate_incidencia_tipo(self, value):
        if value not in IncidenciaTipo.values:
            raise serializers.ValidationError(f"'{value}' no es un tipo de evaluación válido.")
        return value
    
    def get_calificacion_label(self, value):
        if not Calificacion.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Calificación con id '{value.id}' no existe.")
        return value