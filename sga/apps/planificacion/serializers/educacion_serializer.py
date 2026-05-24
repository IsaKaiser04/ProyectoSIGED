from rest_framework import serializers
from ..models.educacion import EducacionNivel, EducacionSubNivel


class EducacionNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionNivel
        fields = ['id', 'nombre', 'codigo', 'periodoPedagogicoMinutos', 'periodoPedagogicoSemanaMinimo']        
        extra_kwargs = {
            'codigo': {'required': True},
            'nombre': {'required': True, 'max_length': 100},
            'periodoPedagogicoMinutos': {'min_value': 0},
            'periodoPedagogicoSemanaMinimo': {'min_value': 0},
        }


class EducacionSubNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubNivel
        fields = ['id', 'nombre', 'codigo', 'periodoPedagogicoSemanaMinimo', 'nivel']
        extra_kwargs = {
            'codigo': {'required': True},
            'nombre': {'required': True, 'max_length': 100},
            'periodoPedagogicoSemanaMinimo': {'min_value': 0},
        }
        
  