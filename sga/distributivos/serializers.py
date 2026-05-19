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

    def validate(self, data):
        """Validar que no exista duplicado docente+horario (excepto en actualización)"""
        docente = data.get('docente')
        horario = data.get('horario')

        # Si es actualización, excluir el registro actual
        query = Distributivo.objects.filter(
            docente=docente,
            horario=horario
        )
        
        # Si estamos actualizando, excluir la instancia actual
        if self.instance:
            query = query.exclude(pk=self.instance.pk)

        if query.exists():
            raise serializers.ValidationError({
                "error": "El docente ya tiene una clase asignada en ese horario"
            })

        return data