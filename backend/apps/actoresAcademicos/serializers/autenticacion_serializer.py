from rest_framework import serializers

class LoginInputSerializer(serializers.Serializer):
    correo_institucional = serializers.EmailField(required=True)
    contrasena = serializers.CharField(required=True, write_only=True)