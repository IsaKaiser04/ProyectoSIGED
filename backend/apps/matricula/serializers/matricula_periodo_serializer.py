from rest_framework import serializers
from apps.matricula.models import MatriculaPeriodo
from apps.institucion.models.institucion import Institucion
from apps.planificacion.models.educacion import EducacionNivel
from apps.planificacion.models.anio_lectivo import AnioLectivo


class MatriculaPeriodoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    institucion_nombre = serializers.SerializerMethodField()
    educacion_nivel_nombre = serializers.SerializerMethodField()
    anio_lectivo_nombre = serializers.SerializerMethodField()

    def get_institucion_nombre(self, obj):
        return obj.institucion.nombre if obj.institucion else ''

    def get_educacion_nivel_nombre(self, obj):
        return obj.educacion_nivel.nombre if obj.educacion_nivel else ''

    def get_anio_lectivo_nombre(self, obj):
        return obj.anio_lectivo.nombre if obj.anio_lectivo else ''

    institucion_id = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(), source='institucion', allow_null=True, required=False
    )
    educacion_nivel_id = serializers.PrimaryKeyRelatedField(
        queryset=EducacionNivel.objects.all(), source='educacion_nivel', allow_null=True, required=False
    )
    anio_lectivo_id = serializers.PrimaryKeyRelatedField(
        queryset=AnioLectivo.objects.all(), source='anio_lectivo', allow_null=True, required=False
    )

    class Meta:
        model = MatriculaPeriodo
        fields = [
            'id', 'nombre', 'tipo', 'tipo_display',
            'fecha_inicio', 'fecha_fin',
            'institucion_id', 'institucion_nombre',
            'educacion_nivel_id', 'educacion_nivel_nombre',
            'anio_lectivo_id', 'anio_lectivo_nombre'
        ]
