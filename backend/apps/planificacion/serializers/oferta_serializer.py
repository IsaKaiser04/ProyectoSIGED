from rest_framework import serializers
from django.db import transaction
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada


class AsignaturaOfertadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignaturaOfertada
        fields = ['id', 'nombre', 'gradoOfertado', 'asignatura', 'esActivo']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 200},
            'gradoOfertado': {'required': True},
            'asignatura': {'required': True},
            'esActivo': {'required': False},
        }

    def validate(self, attrs):
        grado_ofertado = attrs.get('gradoOfertado') or (self.instance.gradoOfertado if self.instance else None)
        asignatura = attrs.get('asignatura') or (self.instance.asignatura if self.instance else None)

        if grado_ofertado and asignatura:
            duplicados = AsignaturaOfertada.objects.filter(
                gradoOfertado=grado_ofertado,
                asignatura=asignatura,
            )
            if self.instance:
                duplicados = duplicados.exclude(pk=self.instance.pk)
            if duplicados.exists():
                raise serializers.ValidationError({
                    "asignatura": f"La asignatura '{asignatura.nombre}' ya está ofertada en el grado '{grado_ofertado.nombre}'."
                })
        return attrs


class GradoOfertadoSerializer(serializers.ModelSerializer):
    asignaturasOfertadas = AsignaturaOfertadaSerializer(many=True, read_only=True)
    grado_id = serializers.IntegerField(source='grado.id', read_only=True)
    grado_nombre = serializers.CharField(source='grado.nombre', read_only=True)

    class Meta:
        model = GradoOfertado
        fields = ['id', 'nombre', 'ofertaAcademica', 'grado', 'grado_id', 'grado_nombre', 'esActivo', 'asignaturasOfertadas']
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'ofertaAcademica': {'required': True},
            'grado': {'required': True},
            'esActivo': {'required': False},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        auth = getattr(request, 'auth', None) if request else None
        institucion_id = auth.get('institucion_id') if auth else None

        grado = attrs.get('grado') or (self.instance.grado if self.instance else None)
        oferta = attrs.get('ofertaAcademica') or (self.instance.ofertaAcademica if self.instance else None)

        if grado and oferta:
            duplicados = GradoOfertado.objects.filter(
                grado=grado,
                ofertaAcademica__anioLectivo_id=oferta.anioLectivo_id,
            )
            if self.instance:
                duplicados = duplicados.exclude(pk=self.instance.pk)
            if duplicados.exists():
                raise serializers.ValidationError({
                    "grado": f"El grado '{grado.nombre}' ya está ofertado para el año lectivo seleccionado."
                })

        if institucion_id and grado:
            grado_institucion_id = grado.institucion_id or (grado.planEstudio.institucion_id if grado.planEstudio else None)
            if grado_institucion_id and grado_institucion_id != institucion_id:
                raise serializers.ValidationError({
                    "grado": "El grado seleccionado no pertenece a su institución."
                })
        return attrs


class OfertaAcademicaSerializer(serializers.ModelSerializer):
    gradosOfertados = GradoOfertadoSerializer(many=True, read_only=True)

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