from rest_framework import serializers
from apps.matricula.models import Requisito


class DocumentoMatriculaSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    matricula_estado = serializers.CharField(source='matricula.estado', read_only=True)
    matricula_estado_display = serializers.CharField(source='matricula.get_estado_display', read_only=True)
    documento_nombre = serializers.CharField(source='matricula_requisito.nombre', read_only=True)
    solicitante_nombre_completo = serializers.SerializerMethodField(read_only=True)
    solicitud_numero = serializers.IntegerField(source='matricula_id', read_only=True)
    aspirante_identificacion = serializers.CharField(source='matricula.asp_identificacion', read_only=True)
    aspirante_celular = serializers.CharField(source='matricula.asp_celular', read_only=True)
    paralelo_nombre = serializers.SerializerMethodField(read_only=True)
    anio_lectivo_nombre = serializers.SerializerMethodField(read_only=True)
    fecha_registro = serializers.DateField(source='matricula.fecha_registro', read_only=True)
    archivo_url = serializers.SerializerMethodField(read_only=True)
    revisado_por_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Requisito
        fields = [
            'id',
            'solicitud_numero', 'solicitante_nombre_completo',
            'aspirante_identificacion', 'aspirante_celular',
            'paralelo_nombre', 'anio_lectivo_nombre', 'fecha_registro',
            'matricula_estado', 'matricula_estado_display',
            'documento_nombre', 'estado', 'estado_display',
            'observacion', 'fecha_revision', 'revisado_por', 'revisado_por_nombre',
            'archivo', 'archivo_url',
        ]

    def get_solicitante_nombre_completo(self, obj):
        return f"{obj.matricula.asp_nombres} {obj.matricula.asp_apellidos}".strip()

    def get_paralelo_nombre(self, obj):
        paralelo = obj.matricula.paralelo
        return getattr(paralelo, 'nombre', '') if paralelo else ''

    def get_anio_lectivo_nombre(self, obj):
        anio_lectivo = obj.matricula.anio_lectivo
        return getattr(anio_lectivo, 'descripcion', '') or str(anio_lectivo) if anio_lectivo else ''

    def get_archivo_url(self, obj):
        if not obj.archivo:
            return None
        return f"/api/matricula/requisitos/{obj.id}/archivo/"

    def get_revisado_por_nombre(self, obj):
        if obj.revisado_por:
            return obj.revisado_por.nombre_usuario
        return None