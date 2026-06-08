from rest_framework import serializers

from ..models import DistributivoAsignatura


class DistributivoAsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributivoAsignatura
        fields = [
            'id',
            'distributivo',
            'asignatura_ofertada_referencia',
            'observacion',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']