from rest_framework import serializers

from ..models import JornadaHora


class JornadaHoraSerializer(serializers.ModelSerializer):
    institucion_nombre = serializers.CharField(source='institucion.nombre', read_only=True)

    class Meta:
        model = JornadaHora
        fields = [
            'id',
            'nombre',
            'hora_inicio',
            'hora_fin',
            'institucion',
            'institucion_nombre',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'institucion_nombre', 'created_at', 'updated_at']

    def validate(self, attrs):
        hora_inicio = attrs.get('hora_inicio', getattr(self.instance, 'hora_inicio', None))
        hora_fin = attrs.get('hora_fin', getattr(self.instance, 'hora_fin', None))
        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})
        return attrs
