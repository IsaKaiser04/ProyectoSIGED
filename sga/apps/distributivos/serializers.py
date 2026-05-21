from rest_framework import serializers
from .models import Distributivo

class DistributivoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Distributivo
        fields = ['id', 'docente', 'materia', 'paralelo', 'horas', 'horario', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_horas(self, value):
        """Validar que las horas estén en rango permitido"""
        if value <= 0:
            raise serializers.ValidationError(
                "Las horas deben ser mayores a 0"
            )
        if value > 40:
            raise serializers.ValidationError(
                "Las horas no pueden exceder 40 por asignación"
            )
        return value

    def validate_docente(self, value):
        """Validar que docente no sea vacío"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "El docente es requerido"
            )
        return value

    def validate_materia(self, value):
        """Validar que materia no sea vacía"""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "La materia es requerida"
            )
        return value
    # Se delega la restricción de unicidad al modelo (UniqueConstraint).
    # Evitamos validaciones que consulten la base de datos aquí para mantener
    # el serializer simple.