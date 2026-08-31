from rest_framework import serializers
from apps.matricula.models import Requisito


class RequisitoListSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    matricula_requisito_detalle = serializers.SerializerMethodField(read_only=True)
    revisado_por_nombre = serializers.SerializerMethodField(read_only=True)
    matricula_requisito_nombre = serializers.SerializerMethodField(read_only=True)
    archivo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Requisito
        fields = [
            'id', 'archivo', 'archivo_url', 'estado', 'estado_display',
            'observacion', 'matricula_requisito',
            'matricula_requisito_detalle', 'matricula_requisito_nombre',
            'revisado_por', 'revisado_por_nombre',
            'fecha_revision'
        ]

    def get_matricula_requisito_detalle(self, obj):
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return MatriculaRequisitoSerializer(obj.matricula_requisito).data

    def get_matricula_requisito_nombre(self, obj):
        return obj.matricula_requisito.nombre if obj.matricula_requisito else ''

    def get_archivo_url(self, obj):
        if not obj.archivo:
            return None
        request = self.context.get('request')
        return f"/api/matricula/requisitos/{obj.id}/archivo/"

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
