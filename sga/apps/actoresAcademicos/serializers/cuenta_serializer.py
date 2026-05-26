from rest_framework import serializers
from apps.actoresAcademicos.models.cuenta import Cuenta
from django.db import transaction

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        # Evitamos exponer el hash de la contraseña en los GET por seguridad
        fields = ['id', 'nombre_usuario','contrasena', 'correo_institucional', 'rol','es_activo']
        extra_kwargs = {
            'contrasena': {'write_only': True} # Solo se usa al crear/cambiar contraseña
        }