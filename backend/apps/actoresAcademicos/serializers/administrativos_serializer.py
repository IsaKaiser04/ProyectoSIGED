from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.actoresAcademicos.models.administrativo import Autoridad, Secretaria, Dece, Administrador
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.institucion.models.institucion import Institucion
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
from django.db import transaction
from rest_framework import serializers


class AutoridadSerializer(UsuarioSerializer):
    # Se crea una Direccion NUEVA por cada usuario con los datos del formulario
    # (calle_principal, calle_secundaria, numero_casa, referencia, parroquia).
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
    cuenta = CuentaSerializer()

    class Meta:
        model = Autoridad
        fields = "__all__"

    def create(self, validated_data):
        validated_data["cuenta"]["rol"] = "AUTORIDAD"
        return self.registrar_usuario_transaccional(
            Autoridad,
            validated_data
        )

    def update(self, instance, validated_data):
        if "cuenta" in validated_data and validated_data["cuenta"]:
            validated_data["cuenta"]["rol"] = "AUTORIDAD"
        return self.actualizar_usuario_transaccional(instance, validated_data)

class SecretariaSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
    cuenta = CuentaSerializer()

    class Meta:
        model = Secretaria
        fields = "__all__"

    def create(self, validated_data):
        validated_data["cuenta"]["rol"] = "SECRETARIA"
        return self.registrar_usuario_transaccional(Secretaria, validated_data)

    def update(self, instance, validated_data):
        if "cuenta" in validated_data and validated_data["cuenta"]:
            validated_data["cuenta"]["rol"] = "SECRETARIA"
        return self.actualizar_usuario_transaccional(instance, validated_data)

class DeceSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
    cuenta = CuentaSerializer()

    class Meta:
        model = Dece
        fields = "__all__"

    def create(self, validated_data):
        validated_data["cuenta"]["rol"] = "DECE"
        return self.registrar_usuario_transaccional(Dece, validated_data)

    def update(self, instance, validated_data):
        if "cuenta" in validated_data and validated_data["cuenta"]:
            validated_data["cuenta"]["rol"] = "DECE"
        return self.actualizar_usuario_transaccional(instance, validated_data)

class AdministradorSerializer(UsuarioSerializer):
    cuenta = CuentaSerializer()

    class Meta:
        model = Administrador
        fields = "__all__"

    def create(self, validated_data):
        cuenta_data = validated_data.pop("cuenta", None)
        cuenta_data["rol"] = "ADMINISTRADOR"
        with transaction.atomic():
            cuenta = self.crear_cuenta(cuenta_data)
            return Administrador.objects.create(cuenta=cuenta, **validated_data)

    def update(self, instance, validated_data):
        cuenta_data = validated_data.pop("cuenta", None)
        with transaction.atomic():
            if cuenta_data and instance.cuenta:
                cuenta_serializer = CuentaSerializer(
                    instance.cuenta, data=cuenta_data, partial=True
                )
                cuenta_serializer.is_valid(raise_exception=True)
                cuenta_serializer.save()
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance