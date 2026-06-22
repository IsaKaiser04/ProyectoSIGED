import jwt
import datetime
from django.conf import settings
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import AuthenticationFailed
from ..repositories.autenticacion_repository import AutenticacionRepository

class AutenticacionService:
    
    @staticmethod
    def iniciar_sesion(correo_institucional: str, contrasena_plana: str) -> dict:
        # 1. Validar Cuenta
        cuenta = AutenticacionRepository.buscar_cuenta_por_correo(correo_institucional)
        if not cuenta:
            raise AuthenticationFailed("Las credenciales son incorrectas o la cuenta está inactiva.")
            
        if not check_password(contrasena_plana, cuenta.contrasena):
            raise AuthenticationFailed("Las credenciales son incorrectas.")
            
        # 2. Obtener el Usuario Humano asociado a esa cuenta
        perfil_usuario = AutenticacionRepository.obtener_perfil_usuario(cuenta)
        if not perfil_usuario:
            raise AuthenticationFailed("La cuenta no tiene un perfil de usuario asignado.")

        # 3. Extraer datos del perfil e institución
        institucion_id = getattr(perfil_usuario, 'institucion_id', None)
        
        # 4. Armar Payload del JWT con datos de cuenta Y de usuario
        secret_key = settings.SECRET_KEY
        payload = {
            "user_id": cuenta.id,
            "username": cuenta.nombre_usuario,
            "rol": cuenta.rol,
            "institucion_id": institucion_id,
            "nombres": perfil_usuario.nombres,
            "apellidos": perfil_usuario.apellidos,
            "identificacion": perfil_usuario.identificacion,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8),
            "iat": datetime.datetime.utcnow()
        }
        
        token_firmado = jwt.encode(payload, secret_key, algorithm="HS256")
        
        # 5. Retorno limpio para el Frontend
        return {
            "token": token_firmado,
            "usuario": {
                "id": cuenta.id,
                "nombre_usuario": cuenta.nombre_usuario,
                "correo_institucional": cuenta.correo_institucional,
                "rol": cuenta.rol,
                "institucion_id": institucion_id,
                "datos_personales": {
                    "nombres": perfil_usuario.nombres,
                    "apellidos": perfil_usuario.apellidos,
                    "identificacion": perfil_usuario.identificacion,
                    "correo_personal": perfil_usuario.correo_personal,
                    "celular": perfil_usuario.celular
                }
            }
        }