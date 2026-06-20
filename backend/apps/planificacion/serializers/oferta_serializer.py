from rest_framework import serializers
from django.db import transaction
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada


class AsignaturaOfertadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaOfertada
        fields = ['id', 'nombre', 'gradoOfertado', 'asignatura']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'gradoOfertado': {'required': True},
            'asignatura': {'required': True},
        }


class GradoOfertadoSerializer(serializers.ModelSerializer):
    asignaturasOfertadas = AsignaturaOfertadaSerializer(many=True, read_only=True)

    class Meta:
        model = GradoOfertado
        fields = ['id', 'nombre', 'ofertaAcademica', 'grado', 'asignaturasOfertadas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'ofertaAcademica': {'required': True},
            'grado': {'required': True},
        }


class OfertaAcademicaSerializer(serializers.ModelSerializer):
    gradosOfertados = GradoOfertadoSerializer(many=True, read_only=True)

    class Meta:
        model = OfertaAcademica
        fields = ['id', 'nombre', 'anioLectivo', 'gradosOfertados']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'anioLectivo': {'required': True},
        }

    def create(self, validated_data):
        with transaction.atomic():
            oferta = OfertaAcademica.objects.create(**validated_data)
        return oferta