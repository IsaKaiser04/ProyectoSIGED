from rest_framework import serializers

from ..models import PlanificacionCurricular, PlanificacionCurricularHistorial


class PlanificacionCurricularSerializer(serializers.ModelSerializer):
    asignatura_nombre = serializers.CharField(source='distributivo_asignatura.asignatura_ofertada.nombre', read_only=True)

    class Meta:
        model = PlanificacionCurricular
        fields = [
            'id',
            'distributivo_asignatura',
            'asignatura_nombre',
            'archivo_pdf',
            'observacion',
            'estado',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'asignatura_nombre', 'created_at', 'updated_at']

    def validate_archivo_pdf(self, value):
        if value and not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('El archivo debe tener extension PDF.')
        return value

    def update(self, instance, validated_data):
        estado_anterior = instance.estado
        observacion = validated_data.get('observacion', instance.observacion)
        planificacion = super().update(instance, validated_data)

        if estado_anterior != planificacion.estado:
            PlanificacionCurricularHistorial.objects.create(
                planificacion_curricular=planificacion,
                estado_anterior=estado_anterior,
                estado_actual=planificacion.estado,
                observacion=observacion or f'Cambio de estado: {estado_anterior} a {planificacion.estado}',
            )

        return planificacion
