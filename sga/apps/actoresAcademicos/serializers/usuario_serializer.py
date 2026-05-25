from rest_framework import serializers
from django.db import transaction
from apps.ubicacion.models import Direccion
from apps.actoresAcademicos.models.cuenta import Cuenta

class UsuarioSerializer(serializers.Serializer):
    # Definimos los campos básicos comunes que heredará la metadata de los hijos
    id = serializers.IntegerField(read_only=True)
    nombres = serializers.CharField(max_length=150)
    apellidos = serializers.CharField(max_length=150)
    identificacion = serializers.CharField(max_length=20)
    tipo_identificacion = serializers.CharField(max_length=10)
    fecha_nacimiento = serializers.DateField()
    celular = serializers.CharField(max_length=15, required=False, allow_blank=True)
    correo_personal = serializers.EmailField()

    def registrar_usuario_transaccional(self, model_class, validated_data):
        """
        Extrae la dirección y la cuenta, valida la petición completa y realiza
        la persistencia atómica (Todo o Nada) para el rol que le sea enviado.
        """
        direccion_data = validated_data.pop('direccion_domicilio', None)
        cuenta_data = validated_data.pop('cuenta', None)

        with transaction.atomic():
            # 1. Creamos la dirección física
            nueva_direccion = None
            if direccion_data:
                nueva_direccion = Direccion.objects.create(**direccion_data)

            # 2. Creamos la cuenta de acceso
            nueva_cuenta = None
            if cuenta_data:
                nueva_cuenta = Cuenta.objects.create(**cuenta_data)

            # 3. Construimos la instancia del rol específico (Estudiante, Docente, etc.)
            instancia = model_class.objects.create(
                cuenta=nueva_cuenta,
                direccion_domicilio=nueva_direccion,
                **validated_data
            )
            
        return instancia