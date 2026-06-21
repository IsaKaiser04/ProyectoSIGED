from rest_framework import serializers

from ..models import Distributivo


class DistributivoSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.CharField(source='docente.__str__', read_only=True)
    anio_lectivo_nombre = serializers.CharField(source='anio_lectivo.nombre', read_only=True)

    class Meta:
        model = Distributivo
        fields = [
            'id',
            'anio_lectivo',
            'anio_lectivo_nombre',
            'docente',
            'docente_nombre',
            'observacion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'anio_lectivo_nombre', 'docente_nombre', 'created_at', 'updated_at']

    def validate(self, attrs):
        if not attrs.get('anio_lectivo', getattr(self.instance, 'anio_lectivo', None)):
            raise serializers.ValidationError({'anio_lectivo': 'El año lectivo es requerido.'})
        if not attrs.get('docente', getattr(self.instance, 'docente', None)):
            raise serializers.ValidationError({'docente': 'El docente es requerido.'})
        return attrs
