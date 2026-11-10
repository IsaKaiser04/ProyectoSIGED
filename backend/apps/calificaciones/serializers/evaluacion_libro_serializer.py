"""
Entrada de la rúbrica de actividades (EvaluacionLibro + secciones).
La salida la arma RubricaService.obtener(); aquí solo se valida forma y tipos.
"""
from rest_framework import serializers


class SeccionRubricaInputSerializer(serializers.Serializer):
    # Sin id = sección nueva.
    id = serializers.IntegerField(required=False, allow_null=True)
    nombre = serializers.CharField(max_length=150)
    # Fracción 0-1 (0.25 = 25 %).
    peso = serializers.DecimalField(max_digits=5, decimal_places=4)
    orden = serializers.IntegerField(min_value=0, required=False, default=0)


class RubricaActividadesInputSerializer(serializers.Serializer):
    anio_lectivo = serializers.IntegerField()
    secciones = SeccionRubricaInputSerializer(many=True)


class CopiarRubricaInputSerializer(serializers.Serializer):
    anio_lectivo = serializers.IntegerField()
    anio_origen = serializers.IntegerField()
