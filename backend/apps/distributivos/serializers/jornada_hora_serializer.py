from rest_framework import serializers

from ..models import JornadaHora


class JornadaHoraSerializer(serializers.ModelSerializer):
    """Serializer para `JornadaHora`.

    Nota: `institucion_educativa_referencia` es un campo temporal (CharField)
    que actúa como marcador para integrar posteriormente un `ForeignKey`
    hacia `InstitucionEducativa`. Mantener como cadena hasta la integración.
    """
    institucion_educativa_referencia = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, max_length=150
    )
    class Meta:
        model = JornadaHora
        fields = [
            'id',
            'nombre',
            'hora_inicio',
            'hora_fin',
            'institucion_educativa_referencia',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Validaciones genéricas del serializer
        hora_inicio = attrs.get('hora_inicio', getattr(self.instance, 'hora_inicio', None))
        hora_fin = attrs.get('hora_fin', getattr(self.instance, 'hora_fin', None))
        if hora_inicio and hora_fin and hora_inicio >= hora_fin:
            raise serializers.ValidationError({'hora_fin': 'La hora fin debe ser mayor que la hora inicio.'})

        # Validación básica para `institucion_educativa_referencia`
        institucion_ref = attrs.get(
            'institucion_educativa_referencia',
            getattr(self.instance, 'institucion_educativa_referencia', None),
        )
        if institucion_ref is not None:
            if institucion_ref == '':
                # Permitimos blank pero normalizamos a None si viene como string vacía
                attrs['institucion_educativa_referencia'] = None
            elif len(institucion_ref) > 150:
                raise serializers.ValidationError({'institucion_educativa_referencia': 'Máximo 150 caracteres.'})
        return attrs