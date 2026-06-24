from rest_framework import serializers

from ..models import Horario


class HorarioListSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='distributivo_asignatura.paralelo.nombre', read_only=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'distributivo_asignatura', 'asignatura_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'paralelo_nombre',
            'hora_inicio', 'hora_fin', 'tipo_horario', 'dia_semana',
            'observacion',
        ]

    def get_distributivo_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return str(obj.distributivo) if obj.distributivo else None


class HorarioDetailSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='distributivo_asignatura.paralelo.nombre', read_only=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'distributivo_asignatura', 'asignatura_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'paralelo_nombre',
            'hora_inicio', 'hora_fin', 'tipo_horario', 'dia_semana',
            'observacion', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'distributivo_nombre', 'asignatura_nombre', 'grado_nombre', 'jornada_nombre', 'paralelo_nombre', 'created_at', 'updated_at']

    def get_distributivo_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return str(obj.distributivo) if obj.distributivo else None


class HorarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = [
            'distributivo', 'distributivo_asignatura', 'jornada_hora',
            'hora_inicio', 'hora_fin', 'tipo_horario', 'dia_semana',
            'observacion',
        ]

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
