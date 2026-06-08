from rest_framework import serializers
from django.db import transaction
from ..models.destinatario import Destinatario


class DestinatarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destinatario
        fields = [
            'id', 'confirmacion', 'visto', 'vistoFecha', 'emailFechaEnvio',
            'notificacion',
            # 'usuario',  # COMENTADO: actoresAcadémicos
        ]
        extra_kwargs = {
            'confirmacion': {'default': False},
            'visto': {'default': False},
            'vistoFecha': {'required': False},
            'emailFechaEnvio': {'required': False},
            'notificacion': {'required': True},
        }

    def create(self, validated_data):
        with transaction.atomic():
            destinatario = Destinatario.objects.create(**validated_data)
        return destinatario