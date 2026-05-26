from rest_framework import serializers
from apps.calificaciones.models.promedio import Promedio

class PromedioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Promedio
        fields = ['id', 'notaCuantitativa', 'notaCualitativa', 'distributivo_asignatura_id', 'matricula_id']