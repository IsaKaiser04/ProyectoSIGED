from rest_framework import serializers

from ..models import Distributivo


class DistributivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distributivo
        fields = [
            'id',
            'anio_lectivo_referencia',
            'docente_referencia',
            'observacion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        anio_lectivo_referencia = attrs.get('anio_lectivo_referencia', getattr(self.instance, 'anio_lectivo_referencia', None))
        docente_referencia = attrs.get('docente_referencia', getattr(self.instance, 'docente_referencia', None))

        if not anio_lectivo_referencia:
            raise serializers.ValidationError({'anio_lectivo_referencia': 'El año lectivo es requerido.'})

        if not docente_referencia:
            raise serializers.ValidationError({'docente_referencia': 'El docente es requerido.'})

        return attrs