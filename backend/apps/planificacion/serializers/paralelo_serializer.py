from rest_framework import serializers
from django.db import transaction
from ..models.paralelo import Paralelo
from apps.actoresAcademicos.models.enums import RolTipo


class ParaleloSerializer(serializers.ModelSerializer):
    cuposDisponibles = serializers.SerializerMethodField(read_only=True)
    gradoOfertadoNombre = serializers.CharField(source='gradoOfertado.nombre', read_only=True)
    gradoOfertadoGradoNombre = serializers.CharField(source='gradoOfertado.grado.nombre', read_only=True)
    docenteTutorNombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Paralelo
        fields = [
            'id', 'nombre', 'cuposMaximo', 'cuposOcupados', 'cuposDisponibles',
            'jornada', 'gradoOfertado', 'gradoOfertadoNombre', 'gradoOfertadoGradoNombre',
            'docenteTutor', 'docenteTutorNombre',
        ]
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 10},
            'cuposMaximo': {'required': True, 'min_value': 1},
            'cuposOcupados': {'default': 0, 'min_value': 0},
            'jornada': {'required': False},
            'gradoOfertado': {'required': True},
            'docenteTutor': {'required': False},
        }

    def get_cuposDisponibles(self, obj):
        return obj.cuposMaximo - obj.cuposOcupados

    def get_docenteTutorNombre(self, obj):
        if obj.docenteTutor:
            return f"{obj.docenteTutor.nombres} {obj.docenteTutor.apellidos}".strip()
        return None

    def validate_docenteTutor(self, value):
        if value is not None:
            cuenta = getattr(value, 'cuenta', None)
            if cuenta is None:
                raise serializers.ValidationError(
                    'El docente seleccionado no tiene una cuenta de usuario asociada.'
                )
            if not cuenta.es_activo:
                raise serializers.ValidationError(
                    'El docente seleccionado no está activo.'
                )
            if cuenta.rol != RolTipo.DOCENTE:
                raise serializers.ValidationError(
                    'El usuario seleccionado no tiene el rol de Docente.'
                )
        return value

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