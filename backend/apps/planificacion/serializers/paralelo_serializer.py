from rest_framework import serializers
from django.db import transaction
from ..models.paralelo import Paralelo


class ParaleloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paralelo
        fields = ['id', 'nombre', 'cuposMaximo', 'cuposOcupados', 'gradoOfertado']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 10},
            'cuposMaximo': {'required': True, 'min_value': 1},
            'cuposOcupados': {'default': 0, 'min_value': 0},
            'gradoOfertado': {'required': True},
        }

    def validate(self, data):
        cupos_max = data.get('cuposMaximo')
        cupos_ocup = data.get('cuposOcupados', 0)
        if cupos_max is not None and cupos_ocup > cupos_max:
            raise serializers.ValidationError(
                {'cuposOcupados': 'Los cupos ocupados no pueden superar los cupos máximos.'}
            )
        return data

    def create(self, validated_data):
        with transaction.atomic():
            paralelo = Paralelo.objects.create(**validated_data)
        return paralelo