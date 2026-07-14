from rest_framework import serializers
from apps.actoresAcademicos.models.titulo import Titulo
from apps.actoresAcademicos.models.universidad import Universidad
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.serializers.universidad_serializer import UniversidadSerializer

class TituloSerializer(serializers.ModelSerializer):
    # Campos para recibir los IDs en el POST/PUT
    docente = serializers.PrimaryKeyRelatedField(
        queryset=Docente.objects.all(), 
        write_only=True
    )
    universidad = serializers.PrimaryKeyRelatedField(
        queryset=Universidad.objects.all(), 
        write_only=True
    )
    
    # Campo detallado para ver la información completa de la universidad en los GET
    universidad_detalle = UniversidadSerializer(source='universidad', read_only=True)

    class Meta:
        model = Titulo
        fields = [
            'id', 
            'docente', 
            'universidad', 
            'universidad_detalle', 
            'titulo', 
            'fecha_senescyt', 
            'registro_senescyt'
        ]

    def validate_registro_senescyt(self, value):
        """
        Validación personalizada por si acaso para limpiar espacios en blanco.
        """
        return value.strip()