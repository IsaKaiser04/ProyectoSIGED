import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models.cuenta import Cuenta


class JwtAuthentication(BaseAuthentication):
    """
    Authentication class that validates JWT tokens from the Authorization header.
    On success, sets:
      - request.user  → Cuenta instance (has .rol, .correo_institucional, etc.)
      - request.auth  → decoded JWT payload (dict)
    """

    keyword = 'Bearer'

    def authenticate_header(self, request):
        return self.keyword

    def authenticate(self, request):
        header = self._extract_header(request)
        if header is None:
            return None

        payload = self._decode_token(header)
        cuenta = self._validate_cuenta(payload)

        return (cuenta, payload)

    def _extract_header(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            raise AuthenticationFailed(
                'Formato de autorización inválido. Use: Bearer <token>'
            )

        return parts[1]

    def _decode_token(self, token):
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('El token ha expirado. Inicie sesión nuevamente.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Token inválido o corrupto.')

    def _validate_cuenta(self, payload):
        user_id = payload.get('user_id')
        if not user_id:
            raise AuthenticationFailed('El token no contiene un identificador de usuario válido.')

        try:
            cuenta = Cuenta.objects.get(id=user_id)
        except Cuenta.DoesNotExist:
            raise AuthenticationFailed('La cuenta asociada al token ya no existe.')

        if not cuenta.es_activo:
            raise AuthenticationFailed('La cuenta está desactivada. Contacte al administrador.')

        return cuenta
