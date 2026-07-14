from rest_framework import serializers
from apps.calificaciones.models.calificacionMejora import CalificacionMejora


class CalificacionMejoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalificacionMejora
        fields = [
            'id', 'valor', 'observacion', 'fecha_registro', 'aprobado',
            'calificacion', 'tipo',
        ]
