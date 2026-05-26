from rest_framework import serializers
from apps.matricula.models import Requisito


class RequisitoSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    matricula_requisito_detalle = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Requisito
        fields = '__all__'

    def get_matricula_requisito_detalle(self, obj):
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return MatriculaRequisitoSerializer(obj.matricula_requisito).data