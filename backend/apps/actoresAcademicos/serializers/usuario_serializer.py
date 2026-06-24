from rest_framework import serializers
from django.db import transaction
from django.contrib.auth.hashers import make_password
from apps.ubicacion.models import Direccion
from apps.actoresAcademicos.models.cuenta import Cuenta

class UsuarioSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombres = serializers.CharField(max_length=150)
    apellidos = serializers.CharField(max_length=150)
    identificacion = serializers.CharField(max_length=20)
    tipo_identificacion = serializers.CharField(max_length=10)
    fecha_nacimiento = serializers.DateField()
    celular = serializers.CharField(max_length=15, required=False, allow_blank=True)
    correo_personal = serializers.EmailField()

    def validate_identificacion(self, value):
        tipo_id = self.initial_data.get('tipo_identificacion')
        if tipo_id == 'CEDULA':
            if not value.isdigit() or len(value) != 10:
                raise serializers.ValidationError("La cédula debe tener exactamente 10 dígitos numéricos.")
        return value

    def crear_direccion(self, direccion_data):
        if direccion_data:
            return Direccion.objects.create(**direccion_data)
        return None

    def crear_cuenta(self, cuenta_data):
        if not cuenta_data:
            return None

        # validar duplicados AQUÍ (antes de crear)
        if Cuenta.objects.filter(nombre_usuario=cuenta_data["nombre_usuario"]).exists():
            raise serializers.ValidationError({"nombre_usuario": "Ya existe"})

        if Cuenta.objects.filter(correo_institucional=cuenta_data["correo_institucional"]).exists():
            raise serializers.ValidationError({"correo_institucional": "Ya existe"})

        cuenta_data["contrasena"] = make_password(cuenta_data["contrasena"])
        return Cuenta.objects.create(**cuenta_data)

    def registrar_usuario_transaccional(self, model_class, validated_data):
        direccion_data = validated_data.pop("direccion_domicilio", None)
        cuenta_data = validated_data.pop("cuenta", None)

        with transaction.atomic():
            direccion = self.crear_direccion(direccion_data)
            cuenta = self.crear_cuenta(cuenta_data)

            return model_class.objects.create(
                cuenta=cuenta,
                direccion_domicilio=direccion,
                **validated_data
            )

    def actualizar_usuario_transaccional(self, instance, validated_data):
        direccion_data = validated_data.pop("direccion_domicilio", None)
        cuenta_data = validated_data.pop("cuenta", None)

        with transaction.atomic():
            if direccion_data:
                from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
                if instance.direccion_domicilio:
                    dir_serializer = DireccionSerializer(
                        instance.direccion_domicilio, data=direccion_data, partial=True
                    )
                    dir_serializer.is_valid(raise_exception=True)
                    dir_serializer.save()
                else:
                    instance.direccion_domicilio = Direccion.objects.create(**direccion_data)

            if cuenta_data and instance.cuenta:
                from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
                cuenta_serializer = CuentaSerializer(
                    instance.cuenta, data=cuenta_data, partial=True
                )
                cuenta_serializer.is_valid(raise_exception=True)
                cuenta_serializer.save()

            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if hasattr(instance, 'institucion') and instance.institucion:
            representation['institucion'] = {
                'id': instance.institucion.id,
                'nombre': instance.institucion.nombre,
                'codigo_amie': instance.institucion.codigo_amie,
                'ruc': instance.institucion.ruc,
            }
        return representation