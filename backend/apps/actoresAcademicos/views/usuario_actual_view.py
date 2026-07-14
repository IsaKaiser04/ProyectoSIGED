from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.actoresAcademicos.repositories.autenticacion_repository import AutenticacionRepository


class UsuarioActualView(APIView):
    """
    Devuelve y actualiza los datos del usuario autenticado (cuenta + perfil).
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

    def patch(self, request):
        cuenta = request.user
        perfil = AutenticacionRepository.obtener_perfil_usuario(cuenta)
        if not perfil:
            return Response({'error': 'Perfil no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.get('datos_personales', request.data)
        allowed = ['nombres', 'apellidos', 'correo_personal', 'celular']
        updated_fields = []
        for field in allowed:
            if field in data:
                setattr(perfil, field, data[field])
                updated_fields.append(field)

        if updated_fields:
            perfil.save(update_fields=updated_fields)
        return Response({
            "mensaje": "Perfil actualizado correctamente",
            "datos_personales": {
                "nombres": perfil.nombres,
                "apellidos": perfil.apellidos,
                "identificacion": perfil.identificacion,
                "correo_personal": perfil.correo_personal,
                "celular": perfil.celular,
            }
        })
