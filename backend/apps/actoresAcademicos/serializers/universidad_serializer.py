from rest_framework import serializers
from django.db import transaction
from apps.actoresAcademicos.models.universidad import Universidad
from apps.ubicacion.models import Direccion
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer

class UniversidadSerializer(serializers.ModelSerializer):
    # Declaramos explícitamente el serializador anidado para lectura/escritura
    direccion = DireccionSerializer()

    class Meta:
        model = Universidad
        fields = ['id', 'nombre', 'direccion']

    def create(self, validated_data):
        # Extraemos los datos internos de la dirección
        direccion_data = validated_data.pop('direccion', None)

        with transaction.atomic():
            nueva_direccion = None
            if direccion_data:
                nueva_direccion = Direccion.objects.create(**direccion_data)

            # Creamos la universidad asociándole la dirección recién generada
            universidad = Universidad.objects.create(
                direccion=nueva_direccion,
                **validated_data
            )
            
        return universidad

    def update(self, instance, validated_data):
        direccion_data = validated_data.pop('direccion', None)
        
        with transaction.atomic():
            # Actualizamos los campos de la universidad
            instance.nombre = validated_data.get('nombre', instance.nombre)
            
            # Actualizamos o creamos la dirección asociada
            if direccion_data:
                if instance.direccion:
                    # Si ya tenía dirección, actualizamos sus atributos
                    for attr, value in direccion_data.items():
                        setattr(instance.direccion, attr, value)
                    instance.direccion.save()
                else:
                    # Si no tenía dirección previa, la creamos desde cero
                    instance.direccion = Direccion.objects.create(**direccion_data)
            
            instance.save()
            
        return instance