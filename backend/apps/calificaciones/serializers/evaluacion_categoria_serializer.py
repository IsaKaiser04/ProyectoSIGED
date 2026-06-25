from rest_framework import serializers
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.tipoCalculo import TipoCalculo

class EvaluacionCategoriaSerializer(serializers.ModelSerializer):
    #mtodo de solo lectura
    subcategorias = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EvaluacionCategoria
        fields = ['id', 'nombre', 'nota_minima', 'nota_maxima', 
        'subcategorias', 'periodoAcademico_id', 'tipo_calculo', 'padre']

    def get_subcategorias(self, obj):
        # Retorna las subcategorías hijas directas
        subcats = obj.subcategorias.all()
        return EvaluacionCategoriaSerializer(subcats, many=True).data

    def get_tipo_calculo_label(self, obj):
        return obj.get_tipo_calculo_display()

    def validate_tipo_calculo(self, value):
        if value not in TipoCalculo.values:
            raise serializers.ValidationError(f"'{value}' no es un tipo de cálculo válido.")
        return value
