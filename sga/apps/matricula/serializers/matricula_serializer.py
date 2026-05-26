from rest_framework import serializers
from apps.matricula.models import Matricula


class MatriculaSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos_count = serializers.IntegerField(source='requisitos.count', read_only=True)
    retiros_count = serializers.IntegerField(source='retiros.count', read_only=True)

    class Meta:
        model = Matricula
        fields = '__all__'
        read_only_fields = ('fecha_registro',)