from rest_framework import serializers

from ..models import Distributivo


class DistributivoListSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.SerializerMethodField(read_only=True)
    anio_lectivo_nombre = serializers.CharField(source='anio_lectivo.nombre', read_only=True)

    class Meta:
        model = Distributivo
        fields = [
            'id', 'anio_lectivo', 'anio_lectivo_nombre',
            'docente', 'docente_nombre', 'observacion',
        ]

    def get_docente_nombre(self, obj):
        if obj.docente:
            return f"{obj.docente.nombres} {obj.docente.apellidos}".strip()
        return None


class DistributivoDetailSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.SerializerMethodField(read_only=True)
    anio_lectivo_nombre = serializers.CharField(source='anio_lectivo.nombre', read_only=True)

    class Meta:
        model = Distributivo
        fields = [
            'id', 'anio_lectivo', 'anio_lectivo_nombre',
            'docente', 'docente_nombre', 'observacion',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'anio_lectivo_nombre', 'docente_nombre', 'created_at', 'updated_at']

    def get_docente_nombre(self, obj):
        if obj.docente:
            return f"{obj.docente.nombres} {obj.docente.apellidos}".strip()
        return None


class DistributivoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Distributivo
        fields = ['anio_lectivo', 'docente', 'observacion']

    def validate(self, attrs):
        if not attrs.get('anio_lectivo'):
            raise serializers.ValidationError({'anio_lectivo': 'El año lectivo es requerido.'})
        if not attrs.get('docente'):
            raise serializers.ValidationError({'docente': 'El docente es requerido.'})
        return attrs
