from django.db.utils import OperationalError
from apps.actoresAcademicos.models.cuenta import Cuenta
from apps.actoresAcademicos.repositories.autenticacion_repository import AutenticacionRepository


class CuentaService:

    @staticmethod
    def puede_desactivar(cuenta: Cuenta) -> tuple:
        try:
            if cuenta.rol == "ADMINISTRADOR":
                primer_admin = Cuenta.objects.filter(rol="ADMINISTRADOR").order_by("id").first()
                if primer_admin and primer_admin.id == cuenta.id:
                    return False, "No se puede desactivar al primer administrador del sistema."

            perfil = AutenticacionRepository.obtener_perfil_usuario(cuenta)
            if perfil and hasattr(perfil, "institucion_id") and perfil.institucion_id is not None:
                return False, "No se puede desactivar un usuario que está asociado a una institución. Elimine la asociación primero."

            return True, ""
        except OperationalError:
            return True, ""

    @staticmethod
    def puede_eliminar(cuenta: Cuenta) -> tuple:
        try:
            if cuenta.rol == "ADMINISTRADOR":
                primer_admin = Cuenta.objects.filter(rol="ADMINISTRADOR").order_by("id").first()
                if primer_admin and primer_admin.id == cuenta.id:
                    return False, "No se puede eliminar al primer administrador del sistema."

            perfil = AutenticacionRepository.obtener_perfil_usuario(cuenta)
            if perfil and hasattr(perfil, "institucion_id") and perfil.institucion_id is not None:
                return False, "No se puede eliminar un usuario que está asociado a una institución. Elimine la asociación primero."

            return True, ""
        except OperationalError:
            return True, ""
