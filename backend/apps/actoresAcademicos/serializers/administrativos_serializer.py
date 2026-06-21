from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.actoresAcademicos.models.administrativo import Autoridad, Secretaria, Dece, Administrador
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.institucion.models.institucion import Institucion
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
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
        return self.registrar_usuario_transaccional(Autoridad, validated_data)


class SecretariaSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
    cuenta = CuentaSerializer()

    class Meta:
        model = Secretaria
        fields = "__all__"

    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Secretaria, validated_data)


class DeceSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
    cuenta = CuentaSerializer()

    class Meta:
        model = Dece
        fields = "__all__"

    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Dece, validated_data)


class AdministradorSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    cuenta = CuentaSerializer()

    class Meta:
        model = Administrador
        fields = "__all__"

    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Administrador, validated_data)