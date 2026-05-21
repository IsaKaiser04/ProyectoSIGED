"""este archivo tiene la función de crear el serializador para el modelo Administrador,
    utilizando el serializador de modelo de Django REST Framework para convertir las instancias 
    del modelo Administrador en formatos JSON y viceversa.
"""
from rest_framework import serializers
from ..models.administrativo import Autoridad, Secretaria, Dece, Administrador
from ..models.cuenta import Cuenta
from .cuenta_serializer import CuentaSerializer
from django.db import transaction


class AutoridadSerializer(serializers.ModelSerializer):
    cuenta = CuentaSerializer()
    class Meta:
        model = Autoridad
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 'cuenta']

    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        with transaction.atomic():
            nueva_cuenta = Cuenta.objects.create(**cuenta_data)
            autoridad = Autoridad.objects.create(cuenta=nueva_cuenta, **validated_data)
        return autoridad


class SecretariaSerializer(serializers.ModelSerializer):
    cuenta = CuentaSerializer()
    class Meta:
        model = Secretaria
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 'cuenta']

    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        with transaction.atomic():
            nueva_cuenta = Cuenta.objects.create(**cuenta_data)
            secretaria = Secretaria.objects.create(cuenta=nueva_cuenta, **validated_data)
        return secretaria


class DeceSerializer(serializers.ModelSerializer):
    cuenta = CuentaSerializer()
    class Meta:
        model = Dece
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'cuenta']
    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        with transaction.atomic():
            nueva_cuenta = Cuenta.objects.create(**cuenta_data)
            dece = Dece.objects.create(cuenta=nueva_cuenta, **validated_data)
        return dece


class AdministradorSerializer(serializers.ModelSerializer):
    cuenta = CuentaSerializer()  # Quitamos read_only para que acepte el POST de la cuenta

    class Meta:
        model = Administrador
        fields = ['id','nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'rol_administrado','cuenta']
    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        with transaction.atomic():
            nueva_cuenta = Cuenta.objects.create(**cuenta_data)
            administrador = Administrador.objects.create(cuenta=nueva_cuenta, **validated_data)
        return administrador