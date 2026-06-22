from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.actoresAcademicos.serializers.autenticacion_serializer import LoginInputSerializer
from apps.actoresAcademicos.services.autenticacion_service import AutenticacionService

class LoginAPIView(APIView):
    """
    Controlador exclusivo para la gestión de acceso inicial al ecosistema SIGED.
    """
    permission_classes = [AllowAny]  # Endpoint público

    def post(self, request):
        # Validar el esquema de entrada con el DTO/Serializer
        serializer = LoginInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        datos = serializer.validated_data
        
        # Delegar el procesamiento completo a la capa lógica de servicios
        sesion_data = AutenticacionService.iniciar_sesion(
            correo_institucional=datos["correo_institucional"],
            contrasena_plana=datos["contrasena"]
        )
        
        return Response(sesion_data, status=status.HTTP_200_OK)