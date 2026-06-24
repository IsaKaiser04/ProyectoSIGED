from apps.actoresAcademicos.models.cuenta import Cuenta

class AutenticacionRepository:
    
    @staticmethod
    def buscar_cuenta_por_correo(correo_institucional: str) -> Cuenta:
        """Busca la cuenta activa por correo."""
        return Cuenta.objects.filter(correo_institucional=correo_institucional, es_activo=True).first()

    @staticmethod
    def obtener_perfil_usuario(cuenta: Cuenta):
        """
        Sigue la relación OneToOne inversa (related_name) según el rol 
        para retornar la instancia física que hereda de Usuario.
        """
        rol = cuenta.rol
        try:
            if rol == "ADMINISTRADOR" and hasattr(cuenta, 'perfil_administrador'):
                return cuenta.perfil_administrador
            elif rol == "AUTORIDAD" and hasattr(cuenta, 'perfil_autoridad'):
                return cuenta.perfil_autoridad
            elif rol == "SECRETARIA" and hasattr(cuenta, 'perfil_secretaria'):
                return cuenta.perfil_secretaria
            elif rol == "DECE" and hasattr(cuenta, 'perfil_dece'):
                return cuenta.perfil_dece
            elif rol == "DOCENTE" and hasattr(cuenta, 'perfil_docente'):
                return cuenta.perfil_docente
            elif rol == "ESTUDIANTE" and hasattr(cuenta, 'perfil_estudiante'):
                return cuenta.perfil_estudiante
        except Exception:
            return None
        return None