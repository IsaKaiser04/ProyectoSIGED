from rest_framework import serializers
from apps.matricula.models import MatriculaPeriodo


class MatriculaPeriodoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    requisitos_detalle = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MatriculaPeriodo
        fields = [
            'id', 'nombre', 'tipo', 'tipo_display',
            'fecha_inicio', 'fecha_fin',
            'institucion_id', 'educacion_nivel_id', 'anio_lectivo_id',
            'requisitos', 'requisitos_detalle'
        ]

    def get_requisitos_detalle(self, obj):
        from apps.matricula.serializers.matricula_requisito_serializer import MatriculaRequisitoSerializer
        return MatriculaRequisitoSerializer(obj.requisitos.all(), many=True).data
