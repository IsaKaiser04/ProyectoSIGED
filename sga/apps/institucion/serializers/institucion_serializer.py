from rest_framework import serializers
from apps.institucion.models.institucion import Institucion

class InstitucionSerializer(serializers.ModelSerializer):
    # Retorna las descripciones completas en las respuestas GET del cliente
    zona_coordinacion_display = serializers.CharField(source='get_zona_coordinacion_display', read_only=True)
    regimen_display = serializers.CharField(source='get_regimen_display', read_only=True)
    sostenimiento_display = serializers.CharField(source='get_sostenimiento_display', read_only=True)
    modalidad_display = serializers.CharField(source='get_modalidad_display', read_only=True)
    jornada_display = serializers.CharField(source='get_jornada_display', read_only=True)

    class Meta:
        model = Institucion
        fields = '__all__'