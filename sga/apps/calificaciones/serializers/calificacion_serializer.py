from rest_framework import serializers
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.promedioCategoria import PromedioCategoria

class CalificacionSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Calificacion
        fields = ['id', 'notaCuantitativa', 'notaCualitativa', 'observacion', 'id_EVA', 'promedio_categoria']

    def get_promedio_categoria_label(self, value):
        if not PromedioCategoria.objects.filter(id=value.id).exists():
            raise serializers.ValidationError(f"Promedio de categoría con id '{value.id}' no existe.")
        return value