from rest_framework import serializers
from apps.asistencia.models import Asistencia


class AsistenciaSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Asistencia
        fields = '__all__'