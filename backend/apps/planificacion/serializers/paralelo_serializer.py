from rest_framework import serializers
from django.db import transaction
from ..models.paralelo import Paralelo


class ParaleloSerializer(serializers.ModelSerializer):
    cuposDisponibles = serializers.SerializerMethodField(read_only=True)
    gradoOfertadoNombre = serializers.CharField(source='gradoOfertado.nombre', read_only=True)
    gradoOfertadoGradoNombre = serializers.CharField(source='gradoOfertado.grado.nombre', read_only=True)

    class Meta:
        model = Paralelo
        fields = [
            'id', 'nombre', 'cuposMaximo', 'cuposOcupados', 'cuposDisponibles',
            'jornada', 'gradoOfertado', 'gradoOfertadoNombre', 'gradoOfertadoGradoNombre',
            'docenteTutor'
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

    def validate(self, data):
        cupos_max = data.get('cuposMaximo')
        cupos_ocup = data.get('cuposOcupados', 0)
        if cupos_max is not None and cupos_ocup > cupos_max:
            raise serializers.ValidationError(
                {'cuposOcupados': 'Los cupos ocupados no pueden superar los cupos máximos.'}
            )

        docente_tutor = data.get('docenteTutor')
        if docente_tutor:
            queryset = Paralelo.objects.filter(docenteTutor=docente_tutor)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {'docenteTutor': 'Este docente ya es tutor de otro paralelo.'}
                )
        return data

    def create(self, validated_data):
        with transaction.atomic():
            paralelo = Paralelo.objects.create(**validated_data)
        return paralelo