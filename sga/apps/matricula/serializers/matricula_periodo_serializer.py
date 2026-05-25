from rest_framework import serializers
from apps.matricula.models import MatriculaPeriodo


class MatriculaPeriodoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    requisitos_detalle = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MatriculaPeriodo
        fields = '__all__'

    def get_requisitos_detalle(self, obj):
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return MatriculaRequisitoSerializer(obj.requisitos.all(), many=True).data