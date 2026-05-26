from rest_framework import serializers
from django.db import transaction
from ..models.notificacion import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    notificacionTipoDisplay = serializers.CharField(source='get_notificacionTipo_display', read_only=True)
    emailEstadoDisplay = serializers.CharField(source='get_emailEstado_display', read_only=True)

    class Meta:
        model = Notificacion
        fields = [
            'id', 'asunto', 'detalle', 'fechaReunion', 'emailEnviar',
            'notificacionTipo', 'notificacionTipoDisplay',
            'emailEstado', 'emailEstadoDisplay',
            # 'remitente',  # COMENTADO: actoresAcadémicos
            # 'distributivoAsignatura',  # COMENTADO: planificación
            # 'matricula',  # COMENTADO: matrícula
            # 'incidencia',  # COMENTADO: acreditación
        ]
        extra_kwargs = {
            'asunto': {'required': True, 'max_length': 200},
            'detalle': {'required': True},
            'fechaReunion': {'required': False},
            'emailEnviar': {'default': False},
            'notificacionTipo': {'required': True},
            'emailEstado': {'default': 'PENDIENTE'},
        }

    def create(self, validated_data):
        with transaction.atomic():
            notificacion = Notificacion.objects.create(**validated_data)
        return notificacion