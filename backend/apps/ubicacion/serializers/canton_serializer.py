from rest_framework import serializers
from apps.ubicacion.models import Canton
from apps.ubicacion.serializers.pais_serializer import PaisSerializer
from apps.ubicacion.serializers.provincia_serializer import ProvinciaSerializer

class CantonSerializer(serializers.ModelSerializer):
    pais_detalle = PaisSerializer(source='provincia.pais', read_only=True)
    provincia_detalle = ProvinciaSerializer(source='provincia', read_only=True)

    class Meta:
        model = Canton
        fields = ['id', 'nombre', 'provincia', 'pais_detalle', 'provincia_detalle']