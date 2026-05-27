from rest_framework import serializers
from django.db import transaction
from ..models.gobernanza import Gobernanza
from ..models.enums import GobernanzaTipo


class GobernanzaSerializer(serializers.ModelSerializer):
    """

    Relaciones comentadas (pendientes de fusión):
        - institucion: ForeignKey a actoresAcademicos.Institucion
        - anioLectivo: ForeignKey a planificacion.AnioLectivo
    """
    gobernanzaTipoDisplay = serializers.CharField(
        source='get_gobernanzaTipo_display',
        read_only=True
    )

    class Meta:
        model = Gobernanza
        fields = [
            'id',
            'archivo',
            'vigenteDesde',
            'vigenteHasta',
            'gobernanzaTipo',
            'gobernanzaTipoDisplay',
            # 'institucion',  # actoresAcademicos no fusionado
            # 'anioLectivo', # planificacion no fusionado
        ]
        extra_kwargs = {
            'archivo': {'required': True},
            'vigenteDesde': {'required': True},
            'vigenteHasta': {'required': True},
            'gobernanzaTipo': {'required': True},
        }

    def validate(self, data):
        # Valida que vigenteDesde sea anterior a vigenteHasta
    
        if data.get('vigenteDesde') and data.get('vigenteHasta'):
            if data['vigenteDesde'] >= data['vigenteHasta']:
                raise serializers.ValidationError(
                    {'vigenteHasta': 'La fecha de vigencia final debe ser posterior a la inicial.'}
                )
        return data

    def create(self, validated_data):
        
        # Crea el documento de gobernanza
        # Usa transaction.atomic() para garantizar integridad
        
        with transaction.atomic():
            gobernanza = Gobernanza.objects.create(**validated_data)
        return gobernanza