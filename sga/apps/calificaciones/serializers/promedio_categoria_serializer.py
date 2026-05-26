from rest_framework import serializers
from apps.calificaciones.models.promedioCategoria import PromedioCategoria

class PromedioCategoriaSerializer(serializers.ModelSerializer):
    #mtodo de solo lectura
    subcategorias = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PromedioCategoria
        fields = ['id', 'notaCuantitativa', 'notaCualitativa', 'subcategorias', 'promedio']

    def get_subcategorias(self, obj):
        # Retorna las subcategorías hijas directas
        subcats = obj.subcategorias.all()
        return PromedioCategoriaSerializer(subcats, many=True).data

