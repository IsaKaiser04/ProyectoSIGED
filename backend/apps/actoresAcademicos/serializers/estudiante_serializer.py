from rest_framework import serializers
from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer

class EstudianteSerializer(UsuarioSerializer, serializers.ModelSerializer):
    # Aquí mapeamos los sub-objetos del JSON
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()

    class Meta:
        model = Estudiante
        fields = [
            'id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 
            'fecha_nacimiento', 'celular', 'correo_personal', 'foto', 
            'direccion_domicilio', 'cuenta'
        ]
    
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Estudiante, validated_data)