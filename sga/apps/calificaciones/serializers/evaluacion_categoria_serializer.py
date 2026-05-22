from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.tipoCalculo import TipoCalculo

class EvaluacionCategoriaSerializer(serializers.ModelSerializer):
    tipo_calculo_label = SerializerMethodField()

    class Meta:
        model = EvaluacionCategoria
        fields = ['id', 'nombre', 'nota_minima', 'nota_maxima', 'tipo_calculo', 'tipo_calculo_label']

    def get_tipo_calculo_label(self, obj):
        return obj.get_tipo_calculo_display()

    def validate_tipo_calculo(self, value):
        if value not in TipoCalculo.values:
            raise serializers.ValidationError(f"'{value}' no es un tipo de cálculo válido.")
        return value