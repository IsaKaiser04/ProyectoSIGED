from rest_framework import serializers
from django.db import transaction
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura
from ..models.enums import NivelEducativo, SubNivelEducativo, ModalidadBachillerato, NIVEL_SUBNIVELES_MAP


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
    nivel_display = serializers.CharField(source='get_nivel_display', read_only=True)
    subnivel_display = serializers.CharField(source='get_subnivel_display', read_only=True)
    modalidad_display = serializers.CharField(source='get_modalidad_display', read_only=True)

    class Meta:
        model = Grado
        fields = [
            'id', 'nombre', 'planEstudio',
            'nivel', 'nivel_display',
            'subnivel', 'subnivel_display',
            'modalidad', 'modalidad_display',
            'anioGrado', 'institucion', 'asignaturas'
        ]
        extra_kwargs = {
            'nombre': {'required': True, 'max_length': 100},
            'planEstudio': {'required': True},
            'nivel': {'required': True},
            'subnivel': {'required': True},
            'modalidad': {'required': False},
            'anioGrado': {'required': True},
            'institucion': {'required': False},
        }

    def validate(self, attrs):
        nivel = attrs.get('nivel')
        subnivel = attrs.get('subnivel')
        modalidad = attrs.get('modalidad')

        # Validar que nivel sea un valor válido del enum
        if nivel and nivel not in [e.value for e in NivelEducativo]:
            raise serializers.ValidationError({
                "nivel": f"Nivel '{nivel}' no es válido. Opciones: {[e.value for e in NivelEducativo]}"
            })

        # Validar que subnivel sea un valor válido del enum
        if subnivel and subnivel not in [e.value for e in SubNivelEducativo]:
            raise serializers.ValidationError({
                "subnivel": f"Subnivel '{subnivel}' no es válido. Opciones: {[e.value for e in SubNivelEducativo]}"
            })

        # Validar que subnivel pertenezca al nivel correcto
        if nivel and subnivel:
            subniveles_validos = NIVEL_SUBNIVELES_MAP.get(nivel, [])
            if subnivel not in subniveles_validos:
                raise serializers.ValidationError({
                    "subnivel": f"El subnivel '{subnivel}' no pertenece al nivel '{nivel}'. Subniveles válidos: {subniveles_validos}"
                })

        # Validar que modalidad solo aplique para Bachillerato
        if modalidad and nivel != NivelEducativo.BACHILLERATO.value:
            raise serializers.ValidationError({
                "modalidad": "La modalidad solo aplica para el nivel Bachillerato"
            })

        # Validar que Bachillerato tenga modalidad
        if nivel == NivelEducativo.BACHILLERATO.value and not modalidad:
            raise serializers.ValidationError({
                "modalidad": "El nivel Bachillerato requiere especificar una modalidad"
            })

        # Validar que modalidad sea un valor válido del enum
        if modalidad and modalidad not in [e.value for e in ModalidadBachillerato]:
            raise serializers.ValidationError({
                "modalidad": f"Modalidad '{modalidad}' no es válida. Opciones: {[e.value for e in ModalidadBachillerato]}"
            })

        # Validar pertenencia a institución
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
        # La validación de periodos pedagógicos mínimos ahora se maneja
        # a nivel de Asignatura y no depende de las tablas de niveles
        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            plan = PlanEstudio.objects.create(**validated_data)
        return plan