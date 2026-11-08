from rest_framework import serializers
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion


class AsignaturaEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaEvaluacion
        fields = [
            'id', 'nombre', 'descripcion', 'fecha_inicio', 'fecha_fin',
            'activo', 'distributivo_asignatura', 'periodo_academico',
            'fecha_entrega', 'tipo_calculo', 'peso',
        ]
        # El CRUD genérico (aula virtual) solo los muestra. Para crearlos o cambiarlos
        # con las reglas de período y pesos se usan los endpoints docente/actividades/.
        read_only_fields = ['fecha_entrega', 'tipo_calculo', 'peso']
