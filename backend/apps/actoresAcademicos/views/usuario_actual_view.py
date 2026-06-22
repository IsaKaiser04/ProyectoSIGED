from rest_framework.views import APIView
from rest_framework.response import Response
from apps.actoresAcademicos.repositories.autenticacion_repository import AutenticacionRepository


class UsuarioActualView(APIView):
    """
    Devuelve los datos del usuario autenticado (cuenta + perfil + institución).
    """

    def get(self, request):
        cuenta = request.user
        perfil = AutenticacionRepository.obtener_perfil_usuario(cuenta)
        return Response({
            "id": cuenta.id,
            "nombre_usuario": cuenta.nombre_usuario,
            "correo_institucional": cuenta.correo_institucional,
            "rol": cuenta.rol,
            "es_activo": cuenta.es_activo,
            "institucion_id": getattr(perfil, 'institucion_id', None),
            "datos_personales": {
                "nombres": perfil.nombres,
                "apellidos": perfil.apellidos,
                "identificacion": perfil.identificacion,
                "tipo_identificacion": perfil.tipo_identificacion,
                "fecha_nacimiento": perfil.fecha_nacimiento,
                "correo_personal": perfil.correo_personal,
                "celular": perfil.celular,
            } if perfil else None,
        })
