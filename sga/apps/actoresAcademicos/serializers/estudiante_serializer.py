from rest_framework import serializers
from apps.actoresAcademicos.models.estudiante import Estudiante
from .cuenta_serializer import CuentaSerializer
from ..models.cuenta import Cuenta
from django.db import transaction

class EstudianteSerializer(serializers.ModelSerializer):
    # Esto serializa el objeto completo de la cuenta, no solo el ID
    cuenta = CuentaSerializer() 

    class Meta:
        model = Estudiante
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'foto', 'cuenta']
    
    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        with transaction.atomic():
            nueva_cuenta = Cuenta.objects.create(**cuenta_data)
            estudiante = Estudiante.objects.create(cuenta=nueva_cuenta, **validated_data)
        return estudiante