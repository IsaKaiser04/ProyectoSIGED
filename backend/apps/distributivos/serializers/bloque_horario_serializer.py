from rest_framework import serializers

from ..models import BloqueHorario


class BloqueHorarioListSerializer(serializers.ModelSerializer):
    paralelo_nombre = serializers.CharField(source='paralelo.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='paralelo.gradoOfertado.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)

    class Meta:
        model = BloqueHorario
        fields = [
            'id', 'paralelo', 'paralelo_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'dia_semana', 'hora_inicio', 'hora_fin', 'orden',
        ]


class BloqueHorarioDetailSerializer(serializers.ModelSerializer):
    paralelo_nombre = serializers.CharField(source='paralelo.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='paralelo.gradoOfertado.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)

    class Meta:
        model = BloqueHorario
        fields = [
            'id', 'paralelo', 'paralelo_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'dia_semana', 'hora_inicio', 'hora_fin', 'orden',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'paralelo_nombre', 'grado_nombre', 'jornada_nombre', 'created_at', 'updated_at']


class BloqueHorarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloqueHorario
        fields = ['paralelo', 'jornada_hora', 'dia_semana', 'hora_inicio', 'hora_fin', 'orden']

    def validate(self, attrs):
        hora_inicio = attrs.get('hora_inicio')
        hora_fin = attrs.get('hora_fin')
        jornada_hora = attrs.get('jornada_hora')

        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})
        if jornada_hora:
            if hora_inicio and hora_inicio < jornada_hora.hora_inicio:
                raise serializers.ValidationError({'hora_inicio': 'La hora inicio debe estar dentro de la jornada.'})
            if hora_fin and hora_fin > jornada_hora.hora_fin:
                raise serializers.ValidationError({'hora_fin': 'La hora fin debe estar dentro de la jornada.'})
        return attrs
