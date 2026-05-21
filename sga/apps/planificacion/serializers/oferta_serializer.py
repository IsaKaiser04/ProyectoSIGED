from rest_framework import serializers

from ..models import AsignaturaOfertada, GradoOfertado, OfertaAcademica


class OfertaAcademicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfertaAcademica
        fields = '__all__'


class GradoOfertadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradoOfertado
        fields = '__all__'


class AsignaturaOfertadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaOfertada
        fields = '__all__'
