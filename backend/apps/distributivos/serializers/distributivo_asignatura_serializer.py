from rest_framework import serializers
from django.core.exceptions import ValidationError
from ..models import DistributivoAsignatura


class DistributivoAsignaturaListSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_ofertada_nombre = serializers.CharField(source='asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='paralelo.nombre', read_only=True)

    class Meta:
        model = DistributivoAsignatura
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'asignatura_ofertada', 'asignatura_ofertada_nombre',
            'grado_nombre',
            'paralelo', 'paralelo_nombre',
            'observacion',
        ]

    def get_distributivo_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return str(obj.distributivo) if obj.distributivo else None


class DistributivoAsignaturaDetailSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_ofertada_nombre = serializers.CharField(source='asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='paralelo.nombre', read_only=True)

    class Meta:
        model = DistributivoAsignatura
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'asignatura_ofertada', 'asignatura_ofertada_nombre',
            'grado_nombre',
            'paralelo', 'paralelo_nombre',
            'observacion', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'distributivo_nombre', 'asignatura_ofertada_nombre', 'grado_nombre', 'paralelo_nombre', 'created_at', 'updated_at']

    def get_distributivo_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return str(obj.distributivo) if obj.distributivo else None


class DistributivoAsignaturaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributivoAsignatura
        fields = ['distributivo', 'asignatura_ofertada', 'paralelo', 'observacion']

    def validate(self, attrs):
        instance = DistributivoAsignatura(**attrs)
        try:
            instance.clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)

        asignatura = attrs.get('asignatura_ofertada')
        paralelo = attrs.get('paralelo')
        distributivo = attrs.get('distributivo')

        if asignatura and paralelo and distributivo:
            conflictos = DistributivoAsignatura.objects.filter(
                asignatura_ofertada=asignatura,
                paralelo=paralelo
            )
            if self.instance:
                conflictos = conflictos.exclude(pk=self.instance.pk)

            conflictos = conflictos.exclude(distributivo=distributivo)

            if conflictos.exists():
                existente = conflictos.first()
                docente_nombre = (
                    f"{existente.distributivo.docente.nombres} {existente.distributivo.docente.apellidos}"
                    if existente.distributivo and existente.distributivo.docente
                    else "otro docente"
                )
                raise serializers.ValidationError(
                    f"La asignatura ya está asignada al paralelo {paralelo.nombre} con el docente {docente_nombre}."
                )

        return attrs

