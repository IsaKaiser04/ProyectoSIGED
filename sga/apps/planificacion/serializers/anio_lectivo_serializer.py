from rest_framework import serializers

from ..models import AnioLectivo, PeriodoAcademico


class AnioLectivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnioLectivo
        fields = '__all__'


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoAcademico
        fields = '__all__'
