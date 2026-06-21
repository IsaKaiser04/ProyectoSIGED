from rest_framework import serializers
from apps.matricula.models import Matricula


class MatriculaSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos_count = serializers.IntegerField(source='requisitos.count', read_only=True)
    retiros_count = serializers.IntegerField(source='retiros.count', read_only=True)
    nombre = serializers.SerializerMethodField(read_only=True)
    codigo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Matricula
        fields = '__all__'
        read_only_fields = ('fecha_registro',)

    def get_nombre(self, obj):
        estudiante = f"Estudiante {obj.estudiante_id}" if obj.estudiante_id else "Sin estudiante"
        return f"Matricula #{obj.id} - {estudiante} - {obj.estado}"

    def get_codigo(self, obj):
        return f"MAT-{obj.id:05d}"
