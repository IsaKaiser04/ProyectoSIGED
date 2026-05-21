from rest_framework import serializers

from ..models import EducacionNivel, EducacionSubNivel


class EducacionNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionNivel
        fields = '__all__'


class EducacionSubNivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubNivel
        fields = '__all__'
