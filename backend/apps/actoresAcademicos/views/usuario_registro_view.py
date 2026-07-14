from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from apps.actoresAcademicos.models.enums import RolTipo
from apps.actoresAcademicos.models.permissions import EsAdministradorGlobal
from apps.actoresAcademicos.serializers.administrativos_serializer import (
    AdministradorSerializer, AutoridadSerializer, SecretariaSerializer, DeceSerializer
)
from apps.actoresAcademicos.serializers.docente_serializer import DocenteSerializer
from apps.actoresAcademicos.serializers.estudiante_serializer import EstudianteSerializer


SERIALIZER_MAP = {
    RolTipo.ADMINISTRADOR: AdministradorSerializer,
    RolTipo.AUTORIDAD: AutoridadSerializer,
    RolTipo.SECRETARIA: SecretariaSerializer,
    RolTipo.DECE: DeceSerializer,
    RolTipo.DOCENTE: DocenteSerializer,
    RolTipo.ESTUDIANTE: EstudianteSerializer,
}

ROLES_SIN_INSTITUCION = {RolTipo.ADMINISTRADOR}


class UsuarioRegistroAdminView(APIView):
    """
    Crea un usuario completo (Cuenta + perfil) según el rol especificado.
    Solo accesible por Administradores Globales.
    """
    permission_classes = [EsAdministradorGlobal]

    def post(self, request):
        rol = request.data.get("rol")
        if not rol:
            raise ValidationError({"rol": "El campo rol es obligatorio."})

        serializer_class = SERIALIZER_MAP.get(rol)
        if not serializer_class:
            raise ValidationError({"rol": f"Rol '{rol}' no es válido."})

        if rol not in ROLES_SIN_INSTITUCION and not request.data.get("institucion"):
            raise ValidationError(
                {"institucion": f"El rol '{rol}' requiere una institución."}
            )

        serializer = serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
