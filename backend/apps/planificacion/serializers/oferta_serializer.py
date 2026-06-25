from rest_framework import serializers
from django.db import transaction
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada


class AsignaturaOfertadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaOfertada
        fields = ['id', 'nombre', 'gradoOfertado', 'asignatura']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'gradoOfertado': {'required': True},
            'asignatura': {'required': True},
        }


class GradoOfertadoSerializer(serializers.ModelSerializer):
    asignaturasOfertadas = AsignaturaOfertadaSerializer(many=True, read_only=True, source='asignaturas_ofertadas')
    grado_id = serializers.IntegerField(source='grado.id', read_only=True)
    grado_nombre = serializers.CharField(source='grado.nombre', read_only=True)

    class Meta:
        model = GradoOfertado
        fields = ['id', 'nombre', 'ofertaAcademica', 'grado', 'grado_id', 'grado_nombre', 'asignaturasOfertadas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'ofertaAcademica': {'required': True},
            'grado': {'required': True},
        }

    def validate(self, attrs):
        grado = attrs.get('grado')
        if grado:
            sum_periods = sum(a.periodoPedagogicoSemanaMinimo for a in grado.asignaturas.all())
            min_semana = 0
            if grado.educacionSubNivel and grado.educacionSubNivel.periodoPedagogicoSemanaMinimo:
                min_semana = grado.educacionSubNivel.periodoPedagogicoSemanaMinimo
            elif grado.educacionNivel and grado.educacionNivel.periodoPedagogicoSemanaMinimo:
                min_semana = grado.educacionNivel.periodoPedagogicoSemanaMinimo

            if sum_periods < min_semana:
                raise serializers.ValidationError({
                    "grado": f"El grado '{grado.nombre}' no cumple con el mínimo de periodos pedagógicos semanales establecido globalmente ({sum_periods} de {min_semana} requeridos)."
                })

        oferta_academica = attrs.get('ofertaAcademica')
        if oferta_academica:
            qs = GradoOfertado.objects.filter(ofertaAcademica=oferta_academica, grado=grado)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    'grado': f'El grado "{grado.nombre}" ya está registrado en esta oferta académica.'
                })

        request = self.context.get('request')
        auth = getattr(request, 'auth', None) if request else None
        institucion_id = auth.get('institucion_id') if auth else None

        if institucion_id and grado:
            grado_institucion_id = grado.institucion_id or (grado.planEstudio.institucion_id if grado.planEstudio else None)
            if grado_institucion_id and grado_institucion_id != institucion_id:
                raise serializers.ValidationError({
                    "grado": "El grado seleccionado no pertenece a su institución."
                })
        return attrs


class OfertaAcademicaSerializer(serializers.ModelSerializer):
    gradosOfertados = GradoOfertadoSerializer(many=True, read_only=True, source='grados_ofertados')

    class Meta:
        model = OfertaAcademica
        fields = ['id', 'nombre', 'anioLectivo', 'gradosOfertados']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'anioLectivo': {'required': True},
        }

    def create(self, validated_data):
        with transaction.atomic():
            oferta = OfertaAcademica.objects.create(**validated_data)
        return oferta