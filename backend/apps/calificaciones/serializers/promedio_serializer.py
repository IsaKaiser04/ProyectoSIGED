from rest_framework import serializers
from apps.calificaciones.models.promedio import Promedio


class PromedioSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Promedio
        fields = [
            'id', 'valor', 'observacion', 'fecha_calculo',
            'matricula', 'distributivo_asignatura', 'periodo_academico',
            'evaluacion_rubrica', 'estudiante_nombre',
        ]

    def get_estudiante_nombre(self, obj):
        if obj.matricula and obj.matricula.estudiante:
            return f"{obj.matricula.estudiante.nombres} {obj.matricula.estudiante.apellidos}"
        return ''
