from rest_framework import serializers
from apps.matricula.models import Matricula
from apps.actoresAcademicos.models import Estudiante, Secretaria
from apps.planificacion.models import AnioLectivo, Paralelo
from apps.matricula.models import Representante


class MatriculaListSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos_count = serializers.IntegerField(source='requisitos.count', read_only=True)
    estudiante_id = serializers.IntegerField(read_only=True)
    estudiante_nombre = serializers.SerializerMethodField(read_only=True)
    paralelo_id = serializers.IntegerField(read_only=True)
    anio_lectivo_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Matricula
        fields = [
            'id', 'codigo_unico', 'estado', 'estado_display',
            'estudiante_id', 'estudiante_nombre', 'paralelo_id', 'anio_lectivo_id',
            'matricula_periodo', 'tiene_discapacidad',
            'rep_nombres', 'rep_apellidos', 'rep_identificacion',
            'rep_telefono', 'rep_parentesco',
            'asp_nombres', 'asp_apellidos', 'asp_fecha_nacimiento', 'asp_correo_personal',
            'fecha_registro', 'requisitos_count', 'institucion'
        ]

    def get_estudiante_nombre(self, obj):
        if obj.estudiante:
            return f"{obj.estudiante.nombres} {obj.estudiante.apellidos}".strip()
        if obj.asp_nombres or obj.asp_apellidos:
            return f"{obj.asp_nombres} {obj.asp_apellidos}".strip()
        return None


class MatriculaDetailSerializer(serializers.ModelSerializer):
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    requisitos = serializers.SerializerMethodField(read_only=True)
    retiros = serializers.SerializerMethodField(read_only=True)
    creado_por_nombre = serializers.SerializerMethodField(read_only=True)
    legalizada_por_nombre = serializers.SerializerMethodField(read_only=True)
    estudiante_id = serializers.IntegerField(read_only=True)
    estudiante_nombre = serializers.SerializerMethodField(read_only=True)
    paralelo_id = serializers.IntegerField(read_only=True)
    anio_lectivo_id = serializers.IntegerField(read_only=True)
    representante_id = serializers.IntegerField(read_only=True)
    secretaria_id = serializers.IntegerField(read_only=True)

    class Meta:
        model = Matricula
        fields = [
            'id', 'codigo_unico', 'estado', 'estado_display',
            'estudiante_id', 'estudiante_nombre', 'paralelo_id', 'anio_lectivo_id', 'representante_id',
            'secretaria_id', 'matricula_periodo',
            'exceder_cupo_autorizado',
            'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad',
            'promedio_anual', 'fecha_registro',
            'creado_por', 'creado_por_nombre',
            'legalizada_por', 'legalizada_por_nombre',
            'rep_nombres', 'rep_apellidos', 'rep_identificacion',
            'rep_telefono', 'rep_parentesco',
            'asp_nombres', 'asp_apellidos', 'asp_fecha_nacimiento', 'asp_correo_personal',
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
            return obj.creado_por.nombre_usuario
        return None

    def get_legalizada_por_nombre(self, obj):
        if obj.legalizada_por:
            return obj.legalizada_por.nombre_usuario
        return None

    def get_estudiante_nombre(self, obj):
        if obj.estudiante:
            return f"{obj.estudiante.nombres} {obj.estudiante.apellidos}".strip()
        if obj.asp_nombres or obj.asp_apellidos:
            return f"{obj.asp_nombres} {obj.asp_apellidos}".strip()
        return None


class MatriculaCreateSerializer(serializers.ModelSerializer):
    estudiante_id = serializers.PrimaryKeyRelatedField(
        queryset=Estudiante.objects.all(), source='estudiante', allow_null=True, required=False
    )
    paralelo_id = serializers.PrimaryKeyRelatedField(
        queryset=Paralelo.objects.all(), source='paralelo', allow_null=True, required=False
    )
    anio_lectivo_id = serializers.PrimaryKeyRelatedField(
        queryset=AnioLectivo.objects.all(), source='anio_lectivo', allow_null=True, required=False
    )

    class Meta:
        model = Matricula
        fields = [
            'estudiante_id', 'paralelo_id', 'anio_lectivo_id',
            'matricula_periodo',
            'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad',
            'rep_nombres', 'rep_apellidos', 'rep_identificacion',
            'rep_telefono', 'rep_parentesco',
            'asp_nombres', 'asp_apellidos', 'asp_fecha_nacimiento', 'asp_correo_personal'
        ]
