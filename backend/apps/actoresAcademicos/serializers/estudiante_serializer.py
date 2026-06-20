from rest_framework import serializers
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.institucion.models.institucion import Institucion
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.actoresAcademicos.serializers.usuario_serializer import UsuarioSerializer
from apps.ubicacion.serializers.direccion_serializer import DireccionSerializer
from apps.actoresAcademicos.serializers.cuenta_serializer import CuentaSerializer

class EstudianteSerializer(UsuarioSerializer, serializers.ModelSerializer):
    # Aquí mapeamos los sub-objetos del JSON
    direccion_domicilio = DireccionSerializer(required=False, allow_null=True)
    cuenta = CuentaSerializer()
    #institucion = serializers.PrimaryKeyRelatedField(queryset=Institucion.objects.all())
   
    # 💡 AJUSTE CLAVE: required=False le dice a DRF que no exija este campo en el JSON de entrada.
    # Además, agregamos read_only de forma implícita para el retorno si fuese necesario, o lo dejamos así
    # para que la vista pueda inyectarlo de forma limpia.
    institucion = serializers.PrimaryKeyRelatedField(
        queryset=Institucion.objects.all(),
        required=False
    )
    institucion_nombre = serializers.CharField(source='institucion.nombre', read_only=True)
    class Meta:
        model = Estudiante
        fields = "__all__"
    
    def create(self, validated_data):
        return self.registrar_usuario_transaccional(Estudiante, validated_data)