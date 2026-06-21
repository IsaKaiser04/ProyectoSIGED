from rest_framework import serializers
from apps.matricula.models import Matricula


class MatriculaListSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos_count = serializers.IntegerField(source='requisitos.count', read_only=True)

    class Meta:
        model = Matricula
        fields = [
            'id', 'codigo_unico', 'estado', 'estado_display',
            'estudiante_id', 'paralelo_id', 'anio_lectivo_id',
            'matricula_periodo', 'tiene_discapacidad',
            'fecha_registro', 'requisitos_count'
        ]


class MatriculaDetailSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos = serializers.SerializerMethodField(read_only=True)
    retiros = serializers.SerializerMethodField(read_only=True)
    creado_por_nombre = serializers.SerializerMethodField(read_only=True)
    legalizada_por_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Matricula
        fields = [
            'id', 'codigo_unico', 'estado', 'estado_display', 'observaciones',
            'estudiante_id', 'paralelo_id', 'anio_lectivo_id', 'representante_id',
            'secretaria_id', 'matricula_periodo',
            'exceder_cupo_autorizado',
            'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad',
            'promedio_anual', 'fecha_registro',
            'creado_por', 'creado_por_nombre',
            'legalizada_por', 'legalizada_por_nombre',
            'created_at', 'updated_at',
            'requisitos', 'retiros'
        ]
        read_only_fields = ['fecha_registro', 'codigo_unico', 'created_at', 'updated_at']

    def get_requisitos(self, obj):
        from apps.matricula.serializers.requisito_serializer import RequisitoListSerializer
        return RequisitoListSerializer(obj.requisitos.all(), many=True).data

    def get_retiros(self, obj):
        from apps.matricula.serializers.retiro_serializer import RetiroSerializer
        return RetiroSerializer(obj.retiros.all(), many=True).data

    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            return f"{obj.creado_por.first_name} {obj.creado_por.last_name}".strip()
        return None

    def get_legalizada_por_nombre(self, obj):
        if obj.legalizada_por:
            return f"{obj.legalizada_por.first_name} {obj.legalizada_por.last_name}".strip()
        return None


class MatriculaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matricula
        fields = [
            'estudiante_id', 'paralelo_id', 'anio_lectivo_id',
            'representante_id', 'matricula_periodo',
            'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad',
            'observaciones'
        ]
