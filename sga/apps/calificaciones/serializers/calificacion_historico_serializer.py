from rest_framework import serializers
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.models.calificacion import Calificacion

class CalificacionHistoricoSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalificacionHistorico
        fields = ['id', 'notaCuantitativa', 'notaCualitativa', 'observacion', 'calificacion']

    
    def get_calificacion_label(self, value):
        if not Calificacion.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Calificación con id '{value.id}' no existe.")
        return value