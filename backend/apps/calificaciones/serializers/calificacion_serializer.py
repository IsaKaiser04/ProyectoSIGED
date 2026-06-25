from rest_framework import serializers
from apps.calificaciones.models.calificacion import Calificacion


class CalificacionSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.SerializerMethodField(read_only=True)
    evaluacion_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Calificacion
        fields = [
            'id', 'valor', 'observacion', 'fecha_registro', 'fecha_actualizacion',
            'asignatura_evaluacion', 'promedio_categoria', 'matricula',
            'estudiante_nombre', 'evaluacion_nombre',
        ]

    def get_estudiante_nombre(self, obj):
        if obj.matricula and obj.matricula.estudiante:
            return f"{obj.matricula.estudiante.nombres} {obj.matricula.estudiante.apellidos}"
        return ''

    def get_evaluacion_nombre(self, obj):
        return obj.asignatura_evaluacion.nombre if obj.asignatura_evaluacion else ''
