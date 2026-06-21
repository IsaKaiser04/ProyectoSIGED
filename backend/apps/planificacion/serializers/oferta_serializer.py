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
    # 💡 Conectamos con el related_name='asignaturas_ofertadas' de tu modelo
    asignaturasOfertadas = AsignaturaOfertadaSerializer(source='asignaturas_ofertadas', many=True, read_only=True)

    class Meta:
        model = GradoOfertado
        fields = ['id', 'nombre', 'ofertaAcademica', 'grado', 'asignaturasOfertadas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'ofertaAcademica': {'required': True},
            'grado': {'required': True},
        }


class OfertaAcademicaSerializer(serializers.ModelSerializer):
    # 💡 Conectamos con el related_name='grados_ofertados' de tu modelo
    gradosOfertados = GradoOfertadoSerializer(source='grados_ofertados', many=True, read_only=True)

    class Meta:
        model = OfertaAcademica
        fields = ['id', 'nombre', 'anioLectivo', 'gradosOfertados']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'anioLectivo': {'required': True},
        }

    def validate_anioLectivo(self, value):
        # 💡 Regla estricta 1 a 1: Si el año lectivo ya tiene oferta, frena el POST con un error 400 limpio
        if OfertaAcademica.objects.filter(anioLectivo=value).exists():
            raise serializers.ValidationError(
                "Este año lectivo ya cuenta con una oferta académica registrada."
            )
        return value

    def create(self, validated_data):
        with transaction.atomic():
            oferta = OfertaAcademica.objects.create(**validated_data)
        return oferta