from rest_framework import serializers
from django.db import transaction
from ..models.calificacion import Calificacion


class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion

        fields = ['id', 'cuantitativa', 'cualitativa', 'asignaturaOfertada']
        extra_kwargs = {
            'cuantitativa': {'required': True, 'min_value': 0, 'max_value': 100},
            'cualitativa': {'required': True, 'max_length': 50},
            'asignaturaOfertada': {'required': True},  # CORREGIDO
        }

    def validate_cuantitativa(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('La calificación debe estar entre 0 y 100.')
        return value

    def create(self, validated_data):
        with transaction.atomic():
            calificacion = Calificacion.objects.create(**validated_data)
        return calificacion