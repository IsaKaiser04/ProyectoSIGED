"""
Serializers de los endpoints de escritura del docente (actividades, notas, supletorio).

Solo validan forma y tipos. Las reglas de negocio (período automático, bloqueo por
fechas, sección de la rúbrica, pertenencia al distributivo) viven en CalificacionService.
"""
from rest_framework import serializers

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion


class ActividadDocenteInputSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True, default='')
    fecha_entrega = serializers.DateField()
    # id de la sección (EvaluacionCategoria) de la rúbrica del año.
    evaluacion_categoria = serializers.IntegerField()


class ActividadDocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaEvaluacion
        fields = [
            'id', 'nombre', 'descripcion', 'fecha_entrega', 'evaluacion_categoria',
            'periodo_academico', 'distributivo_asignatura',
        ]


class NotaInputSerializer(serializers.Serializer):
    matricula = serializers.IntegerField()
    valor = serializers.DecimalField(max_digits=5, decimal_places=2)
    observacion = serializers.CharField(required=False, allow_blank=True, default='')


class SupletorioInputSerializer(serializers.Serializer):
    matricula = serializers.IntegerField()
    valor = serializers.DecimalField(max_digits=4, decimal_places=2)
    observacion = serializers.CharField(required=False, allow_blank=True, default='')
