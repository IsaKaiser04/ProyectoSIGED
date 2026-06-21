from rest_framework import serializers

from ..models import DistributivoAsignatura


class DistributivoAsignaturaSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.CharField(source='distributivo.__str__', read_only=True)
    asignatura_ofertada_nombre = serializers.CharField(source='asignatura_ofertada.nombre', read_only=True)

    class Meta:
        model = DistributivoAsignatura
        fields = [
            'id',
            'distributivo',
            'distributivo_nombre',
            'asignatura_ofertada',
            'asignatura_ofertada_nombre',
            'observacion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'distributivo_nombre', 'asignatura_ofertada_nombre', 'created_at', 'updated_at']
