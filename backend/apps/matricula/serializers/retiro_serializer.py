from rest_framework import serializers
from apps.matricula.models import Retiro


class RetiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retiro
        fields = ['id', 'fecha', 'motivo', 'matricula']
        read_only_fields = ['fecha']
