from rest_framework import serializers
from apps.matricula.models import MatriculaRequisito


class MatriculaRequisitoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = MatriculaRequisito
        fields = '__all__'