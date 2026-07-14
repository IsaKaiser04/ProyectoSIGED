from rest_framework import serializers
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion


class AsignaturaEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaEvaluacion
        fields = [
            'id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
            'activo', 'distributivo_asignatura', 'periodo_academico',
        ]
