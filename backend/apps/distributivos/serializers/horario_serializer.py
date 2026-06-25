from rest_framework import serializers

from ..models import Horario, BloqueHorario


class HorarioListSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    jornada_nombre = serializers.CharField(source='jornada_hora.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='distributivo_asignatura.paralelo.nombre', read_only=True)
    bloque_horario_id = serializers.IntegerField(source='bloque_horario.id', read_only=True, allow_null=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'distributivo_asignatura', 'asignatura_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'paralelo_nombre', 'bloque_horario_id',
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
    bloque_horario_id = serializers.IntegerField(source='bloque_horario.id', read_only=True, allow_null=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'distributivo_asignatura', 'asignatura_nombre', 'grado_nombre',
            'jornada_hora', 'jornada_nombre',
            'paralelo_nombre', 'bloque_horario_id',
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
            'bloque_horario',
            'hora_inicio', 'hora_fin', 'tipo_horario', 'dia_semana',
            'observacion',
        ]

    def validate(self, attrs):
        bloque_horario = attrs.get('bloque_horario')
        da = attrs.get('distributivo_asignatura')

        hora_inicio = attrs.get('hora_inicio') or (bloque_horario.hora_inicio if bloque_horario else None)
        hora_fin = attrs.get('hora_fin') or (bloque_horario.hora_fin if bloque_horario else None)
        dia_semana = attrs.get('dia_semana') or (bloque_horario.dia_semana if bloque_horario else None)
        jornada_hora = attrs.get('jornada_hora') or (bloque_horario.jornada_hora if bloque_horario else None)

        if bloque_horario:
            if da and bloque_horario.paralelo_id != da.paralelo_id:
                raise serializers.ValidationError(
                    'El bloque horario no corresponde al paralelo de la asignatura.'
                )

            conflictos = Horario.objects.filter(bloque_horario=bloque_horario)
            if self.instance:
                conflictos = conflictos.exclude(pk=self.instance.pk)
            if conflictos.exists():
                existente = conflictos.first()
                docente = (
                    existente.distributivo.docente
                    if existente.distributivo and existente.distributivo.docente
                    else None
                )
                nombre_docente = f"{docente.nombres} {docente.apellidos}" if docente else "otro docente"
                asignatura = existente.distributivo_asignatura.asignatura_ofertada.nombre if existente.distributivo_asignatura and existente.distributivo_asignatura.asignatura_ofertada else ""
                raise serializers.ValidationError(
                    f'El bloque horario ya está asignado a {asignatura} con el docente {nombre_docente}.'
                )

        # Validacion de hora_inicio < hora_fin
        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})

        # Validacion de jornada
        if jornada_hora:
            if hora_inicio and hora_inicio < jornada_hora.hora_inicio:
                raise serializers.ValidationError({'hora_inicio': 'La hora inicio debe estar dentro de la jornada.'})
            if hora_fin and hora_fin > jornada_hora.hora_fin:
                raise serializers.ValidationError({'hora_fin': 'La hora fin debe estar dentro de la jornada.'})

        # Validacion de choques: mismo paralelo, mismo dia, horario solapado
        if da and dia_semana and hora_inicio and hora_fin:
            conflictos = Horario.objects.filter(
                distributivo_asignatura__paralelo_id=da.paralelo_id,
                dia_semana=dia_semana,
                hora_inicio__lt=hora_fin,
                hora_fin__gt=hora_inicio,
            )
            if self.instance:
                conflictos = conflictos.exclude(pk=self.instance.pk)
            if bloque_horario:
                conflictos = conflictos.exclude(bloque_horario=bloque_horario)

            if conflictos.exists():
                existente = conflictos.first()
                docente = (
                    existente.distributivo.docente
                    if existente.distributivo and existente.distributivo.docente
                    else None
                )
                nombre_docente = f"{docente.nombres} {docente.apellidos}" if docente else "otro docente"
                asignatura = existente.distributivo_asignatura.asignatura_ofertada.nombre if existente.distributivo_asignatura and existente.distributivo_asignatura.asignatura_ofertada else ""
                raise serializers.ValidationError(
                    f'Choque de horario: {asignatura} ya tiene clase en este horario con el docente {nombre_docente} en el mismo paralelo.'
                )

        return attrs


class HorarioDocenteSerializer(serializers.ModelSerializer):
    orden = serializers.SerializerMethodField(read_only=True)
    paralelo_nombre = serializers.CharField(source='distributivo_asignatura.paralelo.nombre', read_only=True)
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.gradoOfertado.nombre', read_only=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo_asignatura',
            'dia_semana', 'hora_inicio', 'hora_fin', 'orden',
            'paralelo_nombre', 'asignatura_nombre', 'grado_nombre',
            'tipo_horario',
        ]

    def get_orden(self, obj):
        if obj.bloque_horario:
            return obj.bloque_horario.orden
        return None


class HorarioParaleloSerializer(serializers.ModelSerializer):
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)
    docente_nombre = serializers.SerializerMethodField(read_only=True)
    orden = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Horario
        fields = [
            'id', 'distributivo_asignatura',
            'dia_semana', 'hora_inicio', 'hora_fin', 'orden',
            'asignatura_nombre', 'docente_nombre',
            'tipo_horario',
        ]

    def get_docente_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return None

    def get_orden(self, obj):
        if obj.bloque_horario:
            return obj.bloque_horario.orden
        return None
