from rest_framework import serializers
from apps.matricula.models import Retiro


class RetiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retiro
        fields = '__all__'