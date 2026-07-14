from rest_framework import serializers
from apps.matricula.models import Representante


class RepresentanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Representante
        fields = ['id', 'nombres', 'apellidos', 'identificacion', 'telefono', 'parentesco']
