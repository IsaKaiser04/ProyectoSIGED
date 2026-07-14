from rest_framework.permissions import BasePermission
from .enums import RolTipo


class EsAutenticado(BasePermission):
    """Requiere que el usuario tenga un token JWT válido."""
    def has_permission(self, request, view):
        return bool(request.auth and request.user)


class EsRol(BasePermission):
    """Permite acceso solo a usuarios con un rol específico."""
    def __init__(self, *roles):
        self.roles = roles

    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol in self.roles


class EsAdministradorGlobal(BasePermission):
    """Solo Administradores Globales."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.ADMINISTRADOR


class EsAutoridadAcademica(BasePermission):
    """Solo Autoridades Académicas."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.AUTORIDAD


class EsSecretaria(BasePermission):
    """Solo Secretarias."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.SECRETARIA


class EsDocente(BasePermission):
    """Solo Docentes."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.DOCENTE


class EsEstudiante(BasePermission):
    """Solo Estudiantes."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.ESTUDIANTE


class EsDece(BasePermission):
    """Solo DECE."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol == RolTipo.DECE


class EsMismaInstitucion(BasePermission):
    """
    Verifica que el recurso (obj) pertenezca a la misma institución que el usuario autenticado.
    Útil para que Autoridades/Docentes solo vean datos de su propia institución.
    """
    def has_object_permission(self, request, view, obj):
        institucion_id = request.auth.get('institucion_id') if request.auth else None
        if institucion_id is None:
            return True  # Administradores globales ven todo
        obj_institucion_id = getattr(obj, 'institucion_id', None)
        if obj_institucion_id is None and hasattr(obj, 'institucion'):
            obj_institucion_id = obj.institucion_id
        return obj_institucion_id == institucion_id


class EsAdminGlobalOAutoridad(BasePermission):
    """Permite acceso a Administradores Globales y Autoridades Académicas."""
    def has_permission(self, request, view):
        if not request.auth:
            return False
        return request.user.rol in (RolTipo.ADMINISTRADOR, RolTipo.AUTORIDAD, RolTipo.SECRETARIA)
