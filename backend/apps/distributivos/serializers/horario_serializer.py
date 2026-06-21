from rest_framework import serializers

from ..models import Horario


class HorarioSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.CharField(source='distributivo.__str__', read_only=True)
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)

    class Meta:
        model = Horario
        fields = [
            'id',
            'distributivo',
            'distributivo_nombre',
            'distributivo_asignatura',
            'asignatura_nombre',
            'jornada_hora',
            'jornada_nombre',
            'hora_inicio',
            'hora_fin',
            'observacion',
            'tipo_horario',
            'dia_semana',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'distributivo_nombre', 'asignatura_nombre', 'jornada_nombre', 'created_at', 'updated_at']

    def validate(self, attrs):
        hora_inicio = attrs.get('hora_inicio', getattr(self.instance, 'hora_inicio', None))
        hora_fin = attrs.get('hora_fin', getattr(self.instance, 'hora_fin', None))
        jornada_hora = attrs.get('jornada_hora', getattr(self.instance, 'jornada_hora', None))

        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})
        if jornada_hora:
            if hora_inicio and hora_inicio < jornada_hora.hora_inicio:
                raise serializers.ValidationError({'hora_inicio': 'La hora inicio debe estar dentro de la jornada.'})
            if hora_fin and hora_fin > jornada_hora.hora_fin:
                raise serializers.ValidationError({'hora_fin': 'La hora fin debe estar dentro de la jornada.'})
        return attrs
