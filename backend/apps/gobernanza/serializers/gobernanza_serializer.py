import os
from rest_framework import serializers
from django.db import transaction, IntegrityError
from ..models.gobernanza import Gobernanza


MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'.pdf'}


class GobernanzaSerializer(serializers.ModelSerializer):
    gobernanzaTipoDisplay = serializers.CharField(
        source='get_gobernanzaTipo_display',
        read_only=True
    )
    institucionNombre = serializers.CharField(
        source='institucion.nombre',
        read_only=True
    )
    anioLectivoNombre = serializers.CharField(
        source='anioLectivo.nombre',
        read_only=True
    )

    class Meta:
        model = Gobernanza
        fields = [
            'id',
            'archivo',
            'vigenteDesde',
            'vigenteHasta',
            'gobernanzaTipo',
            'gobernanzaTipoDisplay',
            'institucion',
            'institucionNombre',
            'anioLectivo',
            'anioLectivoNombre',
            'es_activo',
        ]
        extra_kwargs = {
            'archivo': {'required': True},
            'vigenteDesde': {'required': True},
            'vigenteHasta': {'required': True},
            'gobernanzaTipo': {'required': True},
            'institucion': {'required': True},
            'anioLectivo': {'required': True},
            'es_activo': {'read_only': True},
        }
        validators = []

    def validate_archivo(self, value):
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError('Solo se permiten archivos en formato PDF.')
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError('El tamaño del archivo excede los 5MB.')
        return value

    def validate(self, data):
        if data.get('vigenteDesde') and data.get('vigenteHasta'):
            if data['vigenteDesde'] >= data['vigenteHasta']:
                raise serializers.ValidationError(
                    {'vigenteHasta': 'La fecha de vigencia final debe ser posterior a la inicial.'}
                )

        anioLectivo = data.get('anioLectivo', getattr(self.instance, 'anioLectivo', None))
        if anioLectivo and anioLectivo.estado == 'CERRADO':
            raise serializers.ValidationError(
                {'anioLectivo': 'No se pueden cargar documentos de gobernanza en un año lectivo cerrado.'}
            )

        institucion = data.get('institucion', getattr(self.instance, 'institucion', None))
        gobernanzaTipo = data.get('gobernanzaTipo', getattr(self.instance, 'gobernanzaTipo', None))

        if institucion and anioLectivo and gobernanzaTipo:
            qs = Gobernanza.objects.filter(
                institucion=institucion,
                anioLectivo=anioLectivo,
                gobernanzaTipo=gobernanzaTipo,
                es_activo=True,
            )
            if self.instance is not None:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'gobernanzaTipo': 'Ya existe un documento activo de este tipo para la misma institución y año lectivo.'}
                )

        return data

    def create(self, validated_data):
        existente = Gobernanza.objects.filter(
            institucion=validated_data['institucion'],
            anioLectivo=validated_data['anioLectivo'],
            gobernanzaTipo=validated_data['gobernanzaTipo'],
        ).first()
        if existente:
            for attr, value in validated_data.items():
                setattr(existente, attr, value)
            existente.es_activo = True
            existente.save()
            return existente
        try:
            return Gobernanza.objects.create(**validated_data)
        except IntegrityError:
            existente = Gobernanza.objects.filter(
                institucion=validated_data['institucion'],
                anioLectivo=validated_data['anioLectivo'],
                gobernanzaTipo=validated_data['gobernanzaTipo'],
            ).first()
            if existente:
                for attr, value in validated_data.items():
                    setattr(existente, attr, value)
                existente.es_activo = True
                existente.save()
                return existente
            raise

    def update(self, instance, validated_data):
        institucion = validated_data.get('institucion', instance.institucion)
        anioLectivo = validated_data.get('anioLectivo', instance.anioLectivo)
        gobernanzaTipo = validated_data.get('gobernanzaTipo', instance.gobernanzaTipo)

        if (institucion != instance.institucion or
            anioLectivo != instance.anioLectivo or
            gobernanzaTipo != instance.gobernanzaTipo):

            existente = Gobernanza.objects.filter(
                institucion=institucion,
                anioLectivo=anioLectivo,
                gobernanzaTipo=gobernanzaTipo,
            ).exclude(pk=instance.pk).first()

            if existente:
                for attr, value in validated_data.items():
                    setattr(existente, attr, value)
                existente.es_activo = True
                existente.save()
                instance.es_activo = False
                instance.save(update_fields=['es_activo'])
                return existente

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.save()
        except IntegrityError:
            existente = Gobernanza.objects.filter(
                institucion=institucion,
                anioLectivo=anioLectivo,
                gobernanzaTipo=gobernanzaTipo,
            ).exclude(pk=instance.pk).first()
            if existente:
                for attr, value in validated_data.items():
                    setattr(existente, attr, value)
                existente.es_activo = True
                existente.save()
                instance.es_activo = False
                instance.save(update_fields=['es_activo'])
                return existente
            raise

        return instance
