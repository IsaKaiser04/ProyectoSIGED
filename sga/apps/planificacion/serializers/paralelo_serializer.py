from rest_framework import serializers

from ..models import Paralelo


class ParaleloSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paralelo
        fields = '__all__'
