from rest_framework.permissions import BasePermission
from apps.actoresAcademicos.models.enums import RolTipo


class EsDocenteOAutoridad(BasePermission):
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol in (RolTipo.DOCENTE, RolTipo.AUTORIDAD, RolTipo.ADMINISTRADOR)


class EsEstudianteOMismaInstitucion(BasePermission):
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol in (RolTipo.ESTUDIANTE, RolTipo.AUTORIDAD, RolTipo.ADMINISTRADOR)


class EsDocenteAsignado(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.rol == RolTipo.ADMINISTRADOR:
            return True
        if request.user.rol == RolTipo.AUTORIDAD:
            return True
        docente = getattr(request.user, 'perfil_docente', None)
        if not docente:
            return False
        asignatura = getattr(obj, 'distributivo_asignatura', None)
        if not asignatura:
            return False
        return asignatura.distributivo.docente_id == docente.id


class EsPropietarioCalificacion(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.rol in (RolTipo.ADMINISTRADOR, RolTipo.AUTORIDAD):
            return True
        estudiante = getattr(request.user, 'perfil_estudiante', None)
        if not estudiante:
            return False
        matricula = getattr(obj, 'matricula', None)
        if not matricula:
            return False
        return matricula.estudiante_id == estudiante.id
