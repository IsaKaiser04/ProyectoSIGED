"""este archivo tiene la función de crear el serializador para el modelo Administrador,
    utilizando el serializador de modelo de Django REST Framework para convertir las instancias 
    del modelo Docente en formatos JSON y viceversa.
"""

from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.institucion.models.institucion import Institucion
from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer
from rest_framework import serializers


class DocenteSerializer(UsuarioSerializer, serializers.ModelSerializer):
    # Campo calculado/derivado que definimos en el modelo
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    institucion = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(),
        required=False
    )
    cuenta = CuentaSerializer()

    class Meta:
        model = Docente
        fields = "__all__" 
    def create(self, validated_data):
        if "cuenta" in validated_data and validated_data["cuenta"]:
            validated_data["cuenta"]["rol"] = "DOCENTE"
        return self.registrar_usuario_transaccional(Docente, validated_data)

    def update(self, instance, validated_data):
        if "cuenta" in validated_data and validated_data["cuenta"]:
            validated_data["cuenta"]["rol"] = "DOCENTE"
        return self.actualizar_usuario_transaccional(instance, validated_data)