from rest_framework import serializers
from apps.asistencia.models import Clase


class ClaseSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Clase
        fields = '__all__'