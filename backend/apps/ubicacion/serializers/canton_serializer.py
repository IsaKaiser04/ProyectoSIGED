from rest_framework import serializers
from apps.ubicacion.models import Canton

class CantonSerializer(serializers.ModelSerializer):
    provincia_nombre = serializers.CharField(source='provincia.nombre', read_only=True)

    class Meta:
        model = Canton
        fields = ['id', 'nombre', 'provincia', 'provincia_nombre']