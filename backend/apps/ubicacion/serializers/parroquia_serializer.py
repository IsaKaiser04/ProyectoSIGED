from rest_framework import serializers
from apps.ubicacion.models import Parroquia

class ParroquiaSerializer(serializers.ModelSerializer):
    canton_nombre = serializers.CharField(source='canton.nombre', read_only=True)

    class Meta:
        model = Parroquia
        fields = ['id', 'nombre', 'canton', 'canton_nombre', 'is_active']