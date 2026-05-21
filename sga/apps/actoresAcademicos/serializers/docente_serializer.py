"""este archivo tiene la función de crear el serializador para el modelo Administrador,
    utilizando el serializador de modelo de Django REST Framework para convertir las instancias 
    del modelo Docente en formatos JSON y viceversa.
"""
from rest_framework import serializers
from apps.actoresAcademicos.models.docente import Docente
from .cuenta_serializer import CuentaSerializer
from ..models.cuenta import Cuenta
from django.db import transaction

class DocenteSerializer(serializers.ModelSerializer):
    cuenta = CuentaSerializer()
    # Campo calculado/derivado que definimos en el modelo
    anios_experiencia = serializers.ReadOnlyField() 

    class Meta:
        model = Docente
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'tipo_identificacion', 'fecha_nacimiento', 'celular', 'correo_personal', 'correo_institucional', 'especialidad', 'fecha_ingreso', 'anios_experiencia', 'cuenta']
    def create(self, validated_data):
        cuenta_data = validated_data.pop('cuenta')
        nueva_cuenta = Cuenta.objects.create(**cuenta_data)
        docente = Docente.objects.create(cuenta=nueva_cuenta, **validated_data)
        return docente