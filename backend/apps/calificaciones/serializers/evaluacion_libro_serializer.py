from rest_framework import serializers
from apps.calificaciones.models.evaluacionLibro import EvaluacionLibro

class EvaluacionLibroSerializer(serializers.ModelSerializer):

    class Meta:
        model = EvaluacionLibro
        fields = ['id', 'nombre', 'institucion_id', 'anio_lectivo_id', 'grado_id']
