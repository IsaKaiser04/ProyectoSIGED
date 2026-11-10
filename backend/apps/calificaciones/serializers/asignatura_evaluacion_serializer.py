from rest_framework import serializers
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion


class AsignaturaEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaEvaluacion
        fields = [
            'id', 'nombre', 'descripcion', 'activo', 'distributivo_asignatura',
            'periodo_academico', 'fecha_entrega', 'evaluacion_categoria',
        ]
        # El CRUD genérico (aula virtual) solo los muestra. Para crearlos o cambiarlos
        # con las reglas de período y rúbrica se usan los endpoints docente/actividades/.
        read_only_fields = ['fecha_entrega', 'evaluacion_categoria']
