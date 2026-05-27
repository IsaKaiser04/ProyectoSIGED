from rest_framework import serializers
from apps.ubicacion.models import Provincia, Pais

class ProvinciaSerializer(serializers.ModelSerializer):
    # Esto permite que al hacer un GET, si deseas, puedas ver el string del país
    pais_nombre = serializers.CharField(source='pais.nombre', read_only=True)

    class Meta:
        model = Provincia
        fields = ['id', 'nombre', 'pais', 'pais_nombre']