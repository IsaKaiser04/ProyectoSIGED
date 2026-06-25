from rest_framework import serializers
from apps.matricula.models import MatriculaRequisito, MatriculaPeriodo
from apps.institucion.models.institucion import Institucion
from apps.planificacion.models.educacion import EducacionNivel


class MatriculaRequisitoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    periodo_nombre = serializers.SerializerMethodField()
    institucion_nombre = serializers.SerializerMethodField()
    educacion_nivel_nombre = serializers.SerializerMethodField()

    periodo_id = serializers.PrimaryKeyRelatedField(
        queryset=MatriculaPeriodo.objects.all(), source='periodo', allow_null=True, required=False
    )
    institucion_id = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(), source='institucion', allow_null=True, required=False
    )
    educacion_nivel_id = serializers.PrimaryKeyRelatedField(
        queryset=EducacionNivel.objects.all(), source='educacion_nivel', allow_null=True, required=False
    )

    class Meta:
        model = MatriculaRequisito
        fields = [
            'id', 'nombre', 'descripcion', 'tipo', 'tipo_display', 'es_obligatorio',
            'periodo_id', 'periodo_nombre',
            'institucion_id', 'institucion_nombre',
            'educacion_nivel_id', 'educacion_nivel_nombre',
        ]

    def get_periodo_nombre(self, obj):
        return str(obj.periodo) if obj.periodo else ''

    def get_institucion_nombre(self, obj):
        return obj.institucion.nombre if obj.institucion else ''

    def get_educacion_nivel_nombre(self, obj):
        return obj.educacion_nivel.nombre if obj.educacion_nivel else ''
