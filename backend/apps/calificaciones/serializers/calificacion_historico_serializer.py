from rest_framework import serializers
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico


class CalificacionHistoricoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalificacionHistorico
        fields = [
            'id', 'valor_anterior', 'valor_nuevo', 'observacion',
            'fecha_registro', 'calificacion',
        ]
