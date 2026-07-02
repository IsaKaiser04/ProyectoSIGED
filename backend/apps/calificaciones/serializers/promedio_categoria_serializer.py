from rest_framework import serializers
from apps.calificaciones.models.promedioCategoria import PromedioCategoria


class PromedioCategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromedioCategoria
        fields = [
            'id', 'valor', 'observacion',
            'promedio', 'evaluacion_categoria', 'promedio_categoria_padre',
        ]
