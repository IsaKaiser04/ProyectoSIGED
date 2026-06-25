from rest_framework import serializers
from django.db import transaction
from ..models.anio_lectivo import AnioLectivo, PeriodoAcademico
from ..models.enums import PeriodoTipo


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

        anio_lectivo = data.get('anioLectivo') or (self.instance.anioLectivo if self.instance else None)
        if anio_lectivo:
            fecha_inicio = data.get('fechaInicio') or (self.instance.fechaInicio if self.instance else None)
            fecha_fin = data.get('fechaFin') or (self.instance.fechaFin if self.instance else None)

            if fecha_inicio and anio_lectivo.fechaInicio and fecha_inicio < anio_lectivo.fechaInicio:
                raise serializers.ValidationError({
                    'fechaInicio': f'La fecha de inicio ({fecha_inicio}) no puede ser anterior a la fecha de inicio del año lectivo ({anio_lectivo.fechaInicio}).'
                })

            if fecha_fin and anio_lectivo.fechaFin and fecha_fin > anio_lectivo.fechaFin:
                raise serializers.ValidationError({
                    'fechaFin': f'La fecha de fin ({fecha_fin}) no puede ser posterior a la fecha de fin del año lectivo ({anio_lectivo.fechaFin}).'
                })

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
        return data