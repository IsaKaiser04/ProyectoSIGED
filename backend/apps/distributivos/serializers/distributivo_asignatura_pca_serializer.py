from rest_framework import serializers
from ..models import DistributivoAsignatura


class DistributivoAsignaturaConPcaSerializer(serializers.ModelSerializer):
    distributivo_nombre = serializers.SerializerMethodField(read_only=True)
    asignatura_ofertada_nombre = serializers.CharField(source='asignatura_ofertada.nombre', read_only=True)
    grado_nombre = serializers.CharField(source='asignatura_ofertada.gradoOfertado.nombre', read_only=True)
    paralelo_nombre = serializers.CharField(source='paralelo.nombre', read_only=True)
    pca_id = serializers.SerializerMethodField(read_only=True)
    pca_estado = serializers.SerializerMethodField(read_only=True)
    pca_estado_display = serializers.SerializerMethodField(read_only=True)
    pca_archivo_url = serializers.SerializerMethodField(read_only=True)
    pca_observacion = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DistributivoAsignatura
        fields = [
            'id', 'distributivo', 'distributivo_nombre',
            'asignatura_ofertada', 'asignatura_ofertada_nombre',
            'grado_nombre',
            'paralelo', 'paralelo_nombre',
            'observacion',
            'pca_id', 'pca_estado', 'pca_estado_display',
            'pca_archivo_url', 'pca_observacion',
        ]

    def get_distributivo_nombre(self, obj):
        if obj.distributivo and obj.distributivo.docente:
            return f"{obj.distributivo.docente.nombres} {obj.distributivo.docente.apellidos}".strip()
        return str(obj.distributivo) if obj.distributivo else None

    def _get_pca(self, obj):
        if hasattr(obj, 'planificacion_curricular') and obj.planificacion_curricular is not None:
            return obj.planificacion_curricular
        return None

    def get_pca_id(self, obj):
        pca = self._get_pca(obj)
        return pca.id if pca else None

    def get_pca_estado(self, obj):
        pca = self._get_pca(obj)
        return pca.estado if pca else None

    def get_pca_estado_display(self, obj):
        pca = self._get_pca(obj)
        return pca.get_estado_display() if pca else None

    def get_pca_archivo_url(self, obj):
        pca = self._get_pca(obj)
        if pca and pca.archivo_pdf:
            try:
                return pca.archivo_pdf.url
            except Exception:
                return None
        return None

    def get_pca_observacion(self, obj):
        pca = self._get_pca(obj)
        return pca.observacion if pca else None
