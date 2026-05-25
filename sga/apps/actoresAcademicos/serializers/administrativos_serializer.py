from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.actoresAcademicos.models.administrativo import Autoridad, Secretaria, Dece, Administrador
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
class AutoridadSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()
    class Meta:
        model = Autoridad
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 'direccion_domicilio', 'cuenta']
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Autoridad, validated_data)

class SecretariaSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()
    class Meta:
        model = Secretaria
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 'direccion_domicilio', 'cuenta']
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Secretaria, validated_data)

class DeceSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()
    class Meta:
        model = Dece
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'direccion_domicilio', 'cuenta']
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Dece, validated_data)

class AdministradorSerializer(UsuarioSerializer):
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()
    class Meta:
        model = Administrador
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'rol_administrado', 'direccion_domicilio', 'cuenta']
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Administrador, validated_data)