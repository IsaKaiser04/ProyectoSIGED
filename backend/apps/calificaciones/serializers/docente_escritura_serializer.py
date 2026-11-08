"""
Serializers de los endpoints de escritura del docente (actividades, notas, supletorio).

Solo validan forma y tipos. Las reglas de negocio (período automático, bloqueo por
fechas, pesos, pertenencia al distributivo) viven en CalificacionService.
"""
from rest_framework import serializers

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.tipoCalculo import TipoCalculo


class ActividadDocenteInputSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=150)
    descripcion = serializers.CharField(required=False, allow_blank=True, default='')
    fecha_entrega = serializers.DateField()
    tipo_calculo = serializers.ChoiceField(
        choices=[TipoCalculo.SIMPLE, TipoCalculo.PONDERADO],
        default=TipoCalculo.SIMPLE,
    )
    # Fracción 0-1 (0.30 = 30 %). Obligatorio solo si tipo_calculo == PONDERADO.
    peso = serializers.DecimalField(max_digits=5, decimal_places=4, required=False, allow_null=True)


class ActividadDocenteSerializer(serializers.ModelSerializer):
    peso = serializers.SerializerMethodField()

    class Meta:
        model = AsignaturaEvaluacion
        fields = [
            'id', 'nombre', 'descripcion', 'fecha_entrega', 'tipo_calculo', 'peso',
            'periodo_academico', 'distributivo_asignatura',
        ]

    def get_peso(self, obj):
        return None if obj.peso is None else float(obj.peso)


class NotaInputSerializer(serializers.Serializer):
    matricula = serializers.IntegerField()
    valor = serializers.DecimalField(max_digits=5, decimal_places=2)
    observacion = serializers.CharField(required=False, allow_blank=True, default='')


class SupletorioInputSerializer(serializers.Serializer):
    matricula = serializers.IntegerField()
    valor = serializers.DecimalField(max_digits=4, decimal_places=2)
    observacion = serializers.CharField(required=False, allow_blank=True, default='')
