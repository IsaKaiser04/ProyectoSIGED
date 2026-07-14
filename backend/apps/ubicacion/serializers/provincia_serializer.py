from rest_framework import serializers
from apps.ubicacion.models.provincia import Provincia
from apps.ubicacion.serializers.pais_serializer import PaisSerializer

class ProvinciaSerializer(serializers.ModelSerializer):
    # Esto te permite leer los datos del país completo en los listados (GET)
    pais_detalle = PaisSerializer(source='pais', read_only=True)

    class Meta:
        model = Provincia
        fields = ['id', 'nombre', 'pais', 'pais_detalle', 'is_active']
        extra_kwargs = {
            # 'pais' se usará para escribir (pasar el ID del país al guardar)
            'pais': {'write_only': True}
        }