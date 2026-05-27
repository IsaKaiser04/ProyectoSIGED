from rest_framework import serializers
from django.db import transaction
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura


class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id', 'nombre', 'periodoPedagogicoSemanaMinimo', 'grado']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'periodoPedagogicoSemanaMinimo': {'min_value': 0},
            'grado': {'required': True},
        }


class GradoSerializer(serializers.ModelSerializer):
    asignaturas = AsignaturaSerializer(many=True, read_only=True)

    class Meta:
        model = Grado
        fields = ['id', 'nombre', 'planEstudio', 'educacionNivel', 'educacionSubNivel', 'asignaturas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'planEstudio': {'required': True},
            'educacionNivel': {'required': True},
            'educacionSubNivel': {'required': True},
        }


class PlanEstudioSerializer(serializers.ModelSerializer):
    grados = GradoSerializer(many=True, read_only=True)

    class Meta:
        model = PlanEstudio
        fields = ['id', 'nombre', 'esActivo', 'grados']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'esActivo': {'default': True},
        }

    def create(self, validated_data):
        with transaction.atomic():
            plan = PlanEstudio.objects.create(**validated_data)
        return plan