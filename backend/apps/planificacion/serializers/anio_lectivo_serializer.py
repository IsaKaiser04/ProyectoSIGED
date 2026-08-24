from rest_framework import serializers
from django.db import transaction
from types import SimpleNamespace
from ..models.anio_lectivo import AnioLectivo, PeriodoAcademico
from ..models.enums import PeriodoTipo
from ..services.distribucion_periodos import validar_distribucion


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    periodoTipoDisplay = serializers.CharField(source='get_periodoTipo_display', read_only=True)

    class Meta:
        model = PeriodoAcademico
        fields = ['id', 'orden', 'nombre', 'fechaInicio', 'fechaFin', 'periodoTipo', 'periodoTipoDisplay', 'anioLectivo']
        extra_kwargs = {
            'orden': {'required': True, 'max_length': 10},
            'nombre': {'required': True, 'max_length': 100},
            'fechaInicio': {'required': True},
            'fechaFin': {'required': True},
            'periodoTipo': {'required': True},
            'anioLectivo': {'required': False},
        }

    def validate(self, data):
        if data.get('fechaInicio') and data.get('fechaFin'):
            if data['fechaInicio'] >= data['fechaFin']:
                raise serializers.ValidationError(
                    {'fechaFin': 'La fecha de fin debe ser posterior a la fecha de inicio.'}
                )
        return data


class AnioLectivoSerializer(serializers.ModelSerializer):
    periodosAcademicos = PeriodoAcademicoSerializer(many=True, required=False)

    class Meta:
        model = AnioLectivo
        fields = ['id', 'nombre', 'fechaInicio', 'fechaFin', 'estado', 'periodosAcademicos']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 50},
            'fechaInicio': {'required': True},
            'fechaFin': {'required': True},
            'estado': {'required': False},
        }

    def validate(self, data):
        if data.get('fechaInicio') and data.get('fechaFin'):
            if data['fechaInicio'] >= data['fechaFin']:
                raise serializers.ValidationError(
                    {'fechaFin': 'La fecha de fin debe ser posterior a la fecha de inicio.'}
                )
        # Valida la distribución reglamentaria de los períodos académicos
        # (régimen de 200 días laborables según el tipo elegido).
        periodos_data = data.get('periodosAcademicos')
        if periodos_data:
            # Solo se valida el rango del año cuando las fechas están presentes
            # (en actualizaciones parciales pueden omitirse).
            anio_ref = None
            if data.get('fechaInicio') and data.get('fechaFin'):
                anio_ref = SimpleNamespace(
                    fechaInicio=data['fechaInicio'],
                    fechaFin=data['fechaFin'],
                )
            errores = validar_distribucion(periodos_data, anio=anio_ref)
            if errores:
                raise serializers.ValidationError({'periodosAcademicos': errores})
        return data
