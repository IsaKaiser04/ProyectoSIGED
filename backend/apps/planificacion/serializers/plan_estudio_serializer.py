from rest_framework import serializers
from django.db import transaction
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura


class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
        fields = ['id', 'nombre', 'periodoPedagogicoSemanaMinimo', 'grado']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'periodoPedagogicoSemanaMinimo': {'min_value': 0},
            'grado': {'required': True},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        auth = getattr(request, 'auth', None) if request else None
        institucion_id = auth.get('institucion_id') if auth else None

        if institucion_id:
            grado = attrs.get('grado')
            if grado:
                grado_institucion_id = grado.institucion_id or (grado.planEstudio.institucion_id if grado.planEstudio else None)
                if grado_institucion_id and grado_institucion_id != institucion_id:
                    raise serializers.ValidationError({
                        "grado": "El grado seleccionado no pertenece a su institución."
                    })
        return attrs


class GradoSerializer(serializers.ModelSerializer):
    asignaturas = AsignaturaSerializer(many=True, read_only=True)

    class Meta:
        model = Grado
        fields = ['id', 'nombre', 'planEstudio', 'educacionNivel', 'educacionSubNivel', 'institucion', 'asignaturas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'planEstudio': {'required': True},
            'educacionNivel': {'required': True},
            'educacionSubNivel': {'required': True},
            'institucion': {'required': False},
        }

    def validate(self, attrs):
        nivel = attrs.get('educacionNivel')
        subnivel = attrs.get('educacionSubNivel')
        if subnivel and nivel and subnivel.nivel_id != nivel.id:
            raise serializers.ValidationError({
                "educacionSubNivel": "El subnivel seleccionado no pertenece al nivel educativo seleccionado."
            })

        request = self.context.get('request')
        auth = getattr(request, 'auth', None) if request else None
        institucion_id = auth.get('institucion_id') if auth else None

        if institucion_id:
            plan = attrs.get('planEstudio')
            if plan and plan.institucion_id and plan.institucion_id != institucion_id:
                raise serializers.ValidationError({
                    "planEstudio": "El plan de estudio seleccionado no pertenece a su institución."
                })
        return attrs


class PlanEstudioSerializer(serializers.ModelSerializer):
    grados = GradoSerializer(many=True, read_only=True)

    class Meta:
        model = PlanEstudio
        fields = ['id', 'nombre', 'esActivo', 'descripcion', 'duracionAnios', 'institucion', 'grados']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'esActivo': {'default': True},
            'descripcion': {'required': False},
            'duracionAnios': {'required': False, 'min_value': 1},
            'institucion': {'required': False},
        }

    def validate(self, attrs):
        esActivo = attrs.get('esActivo')
        if esActivo or (esActivo is None and self.instance and self.instance.esActivo):
            instance = self.instance
            if instance:
                for grado in instance.grados.all():
                    sum_periods = sum(a.periodoPedagogicoSemanaMinimo for a in grado.asignaturas.all())
                    min_semana = 0
                    if grado.educacionSubNivel and grado.educacionSubNivel.periodoPedagogicoSemanaMinimo:
                        min_semana = grado.educacionSubNivel.periodoPedagogicoSemanaMinimo
                    elif grado.educacionNivel and grado.educacionNivel.periodoPedagogicoSemanaMinimo:
                        min_semana = grado.educacionNivel.periodoPedagogicoSemanaMinimo

                    if sum_periods < min_semana:
                        raise serializers.ValidationError({
                            "non_field_errors": f"El grado '{grado.nombre}' no cumple con el mínimo de periodos pedagógicos semanales establecido globalmente ({sum_periods} de {min_semana} requeridos)."
                        })
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            plan = PlanEstudio.objects.create(**validated_data)
        return plan