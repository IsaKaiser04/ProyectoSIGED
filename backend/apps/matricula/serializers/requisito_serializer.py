from rest_framework import serializers
from apps.matricula.models import Requisito


class RequisitoListSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    matricula_requisito_detalle = serializers.SerializerMethodField(read_only=True)
    revisado_por_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Requisito
        fields = [
            'id', 'archivo', 'estado', 'estado_display',
            'observacion', 'matricula_requisito',
            'matricula_requisito_detalle',
            'revisado_por', 'revisado_por_nombre',
            'fecha_revision'
        ]

    def get_matricula_requisito_detalle(self, obj):
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return MatriculaRequisitoSerializer(obj.matricula_requisito).data

    def get_revisado_por_nombre(self, obj):
        if obj.revisado_por:
            return obj.revisado_por.nombre_usuario
        return None


class RequisitoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisito
        fields = ['matricula', 'matricula_requisito', 'archivo', 'observacion']


class RequisitoUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requisito
        fields = ['estado', 'observacion', 'archivo']
