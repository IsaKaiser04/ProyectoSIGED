from rest_framework import serializers
from apps.asistencia.models import Incidencia, IncidenciaTipo


class IncidenciaListSerializer(serializers.ModelSerializer):
    """Serializer para listados."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    registrado_por_nombre = serializers.SerializerMethodField(read_only=True)
    fecha_registro = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')

    class Meta:
        model = Incidencia
        fields = [
            'id', 'asunto', 'tipo', 'tipo_display', 'estado',
            'notificar', 'registrado_por', 'registrado_por_nombre',
            'fecha_registro'
        ]

    def get_registrado_por_nombre(self, obj):
        if obj.registrado_por:
            return f"{obj.registrado_por.first_name} {obj.registrado_por.last_name}".strip()
        return None


class IncidenciaDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalle y creación."""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    registrado_por_nombre = serializers.SerializerMethodField(read_only=True)
    fecha_registro = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M:%S')
    archivo_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Incidencia
        fields = [
            'id', 'asunto', 'detalle', 'archivo', 'archivo_url',
            'tipo', 'tipo_display', 'estado', 'notificar',
            'asistencia', 'matricula', 'incidencia_calificacion_id',
            'registrado_por', 'registrado_por_nombre',
            'fecha_registro', 'fecha_modificacion'
        ]
        read_only_fields = ['registrado_por', 'fecha_registro', 'fecha_modificacion']

    def get_registrado_por_nombre(self, obj):
        if obj.registrado_por:
            return f"{obj.registrado_por.first_name} {obj.registrado_por.last_name}".strip()
        return None

    def get_archivo_url(self, obj):
        if obj.archivo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.archivo.url)
            return obj.archivo.url
        return None

    def validate_archivo(self, value):
        if value:
            # Validar tamaño máximo 5MB
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("El archivo no debe superar los 5MB.")
            # Validar extensión
            extensiones_permitidas = ['.pdf', '.jpg', '.jpeg', '.png']
            import os
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in extensiones_permitidas:
                raise serializers.ValidationError(f"Extensiones permitidas: {', '.join(extensiones_permitidas)}")
        return value
