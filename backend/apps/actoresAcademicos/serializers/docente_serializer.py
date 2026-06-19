"""este archivo tiene la función de crear el serializador para el modelo Administrador,
    utilizando el serializador de modelo de Django REST Framework para convertir las instancias 
    del modelo Docente en formatos JSON y viceversa.
"""
from rest_framework import serializers
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer


class DocenteSerializer(UsuarioSerializer, serializers.ModelSerializer):
    # Campo calculado/derivado que definimos en el modelo
    anios_experiencia = serializers.ReadOnlyField() 
    direccion_domicilio = DireccionSerializer()
    cuenta = CuentaSerializer()
    class Meta:
        model = Docente
        fields = [
                    'id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 
                    'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 
                    'especialidad', 'fecha_ingreso', 'anios_experiencia', 
                    'direccion_domicilio', 'cuenta'
                ]   
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Docente, validated_data)