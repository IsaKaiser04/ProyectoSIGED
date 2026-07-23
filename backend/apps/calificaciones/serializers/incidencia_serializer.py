from rest_framework import serializers
from apps.calificaciones.models.Incidencia import Incidencia


class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = [
            'id', 'asunto', 'detalle', 'archivo', 'notificar',
            'fecha_registro', 'tipo', 'calificaciones',
        ]
