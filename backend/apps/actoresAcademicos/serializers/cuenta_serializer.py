from rest_framework import serializers
from apps.actoresAcademicos.models.cuenta import Cuenta
from django.contrib.auth.hashers import make_password

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        # Evitamos exponer el hash de la contraseña en los GET por seguridad
        fields = "__all__"    
        extra_kwargs = {
            'contrasena': {'write_only': True} # Solo se usa al crear/cambiar contraseña
        }

    def create(self, validated_data):
        contrasena = validated_data.get('contrasena')
        if contrasena:
            validated_data['contrasena'] = make_password(contrasena)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        contrasena = validated_data.get('contrasena')
        if contrasena:
            validated_data['contrasena'] = make_password(contrasena)
        return super().update(instance, validated_data)