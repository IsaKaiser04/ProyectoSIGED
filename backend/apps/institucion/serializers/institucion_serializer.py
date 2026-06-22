from rest_framework import serializers
from apps.institucion.models.institucion import Institucion
from apps.ubicacion.models import Direccion
from apps.ubicacion.serializers import DireccionSerializer

class InstitucionSerializer(serializers.ModelSerializer):
    # ──► INYECCIÓN ANIDADA: El JSON esperará un objeto de dirección completo: { ... }
    direccion = DireccionSerializer()

    # Retorna las descripciones completas en las respuestas GET del cliente
    zona_coordinacion_display = serializers.CharField(source='get_zona_coordinacion_display', read_only=True)
    regimen_display = serializers.CharField(source='get_regimen_display', read_only=True)
    sostenimiento_display = serializers.CharField(source='get_sostenimiento_display', read_only=True)
    modalidad_display = serializers.CharField(source='get_modalidad_display', read_only=True)
    jornada_display = serializers.CharField(source='get_jornada_display', read_only=True)

    class Meta:
        model = Institucion
        fields = '__all__'

    # ══════════════════════════════════════════════════════════════════════════
    # LÓGICA DE CREACIÓN (POST)
    # ══════════════════════════════════════════════════════════════════════════
    def create(self, validated_data):
        # 1. Extraemos los datos internos de la dirección sacándolos del diccionario principal
        direccion_data = validated_data.pop('direccion')

        # 2. Creamos primero la instancia de la Dirección en su respectiva tabla
        direccion_instancia = Direccion.objects.create(**direccion_data)

        # 3. Creamos la institución pasándole la dirección recién generada
        institucion = Institucion.objects.create(direccion=direccion_instancia, **validated_data)
        return institucion

    # ══════════════════════════════════════════════════════════════════════════
    # LÓGICA DE ACTUALIZACIÓN (PUT / PATCH)
    # ══════════════════════════════════════════════════════════════════════════
    def update(self, instance, validated_data):
        # 1. Extraemos los datos de la dirección si vienen en la petición
        direccion_data = validated_data.pop('direccion', None)

        # 2. Si se enviaron datos para actualizar la dirección física
        if direccion_data:
            direccion_instancia = instance.direccion
            for attr, value in direccion_data.items():
                setattr(direccion_instancia, attr, value)
            direccion_instancia.save()

        # 3. Actualizamos los campos directos de la Institución (AMIE, nombre, etc.)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance