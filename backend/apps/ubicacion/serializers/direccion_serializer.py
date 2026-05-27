from rest_framework import serializers
from apps.ubicacion.models import Direccion

class DireccionSerializer(serializers.ModelSerializer):
    # Representación anidada opcional para cuando el frontend pida el detalle completo de la ubicación
    parroquia_detalle = serializers.SerializerMethodField()

    class Meta:
        model = Direccion
        fields = [
            'id', 
            'calle_principal', 
            'calle_secundaria', 
            'numero_casa', 
            'referencia', 
            'parroquia',
            'parroquia_detalle'
        ]
        extra_kwargs = {
            'parroquia': {'write_only': True} 
        }

    def get_parroquia_detalle(self, obj):
            try:
                return {
                    "parroquia": obj.parroquia.nombre,
                    "canton": obj.parroquia.canton.nombre,
                    "provincia": obj.parroquia.canton.provincia.nombre,
                    "pais": obj.parroquia.canton.provincia.pais.nombre
                }
            except AttributeError:
                return None# En caso de que la dirección no tenga una parroquia asociada, se devuelve None.