from rest_framework import serializers
from django.db import transaction
from ..models.anio_lectivo import AnioLectivo, PeriodoAcademico
from ..models.enums import PeriodoTipo


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    periodoTipoDisplay = serializers.CharField(source='get_periodoTipo_display', read_only=True)

    class Meta:
        model = PeriodoAcademico
        fields = ['id', 'orden', 'nombre', 'fechaInicio', 'fechaFin', 'periodoTipo', 'periodoTipoDisplay', 'anioLectivo']
        extra_kwargs = {
            'orden': {'required': True, 'max_length': 10},
            'nombre': {'required': True, 'max_length': 100},
            'fechaInicio': {'required': True},
            'fechaFin': {'required': True},
            'periodoTipo': {'required': True},
            'anioLectivo': {'required': True},
        }

    def validate(self, data):
        if data.get('fechaInicio') and data.get('fechaFin'):
            if data['fechaInicio'] >= data['fechaFin']:
                raise serializers.ValidationError(
                    {'fechaFin': 'La fecha de fin debe ser posterior a la fecha de inicio.'}
                )
        return data


class AnioLectivoSerializer(serializers.ModelSerializer):
    periodosAcademicos = PeriodoAcademicoSerializer(many=True, read_only=True)

    class Meta:
        model = AnioLectivo
        fields = ['id', 'nombre', 'fechaInicio', 'fechaFin', 'esActivo', 'periodosAcademicos']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 50},
            'fechaInicio': {'required': True},
            'fechaFin': {'required': True},
            'esActivo': {'default': True},
        }

    def validate(self, data):
        if data.get('fechaInicio') and data.get('fechaFin'):
            if data['fechaInicio'] >= data['fechaFin']:
                raise serializers.ValidationError(
                    {'fechaFin': 'La fecha de fin debe ser posterior a la fecha de inicio.'}
                )
        return data

    def create(self, validated_data):
        with transaction.atomic():
            anio = AnioLectivo.objects.create(**validated_data)
        return anio