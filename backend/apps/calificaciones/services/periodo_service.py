from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.planificacion.models import PeriodoAcademico


class PeriodoService:
    """Reglas de negocio 2 (asignación automática) y 5 (bloqueo de fechas)."""

    @staticmethod
    def asignar_periodo(distributivo_asignatura, fecha_entrega):
        """
        Regla 2: devuelve el PeriodoAcademico cuya fechaInicio <= fecha_entrega <= fechaFin.

        Además de las fechas se filtra por el AÑO LECTIVO del distributivo: la tabla
        contiene períodos de todos los años (y de varias instituciones), y sin ese
        filtro una fecha podría caer en el período de otro año/institución.
        """
        if fecha_entrega is None:
            raise ValidationError({'fecha_entrega': 'La fecha de entrega es obligatoria.'})

        anio = distributivo_asignatura.distributivo.anio_lectivo
        if anio is None:
            raise ValidationError(
                {'detail': 'El distributivo de esta asignatura no tiene año lectivo asignado.'}
            )

        periodo = (
            PeriodoAcademico.objects
            .filter(
                anioLectivo=anio,
                fechaInicio__lte=fecha_entrega,
                fechaFin__gte=fecha_entrega,
            )
            .order_by('fechaInicio')
            .first()
        )
        if periodo is None:
            raise ValidationError({
                'fecha_entrega': (
                    f'La fecha {fecha_entrega.isoformat()} no pertenece a ningún período '
                    f'académico del año lectivo "{anio.nombre}".'
                )
            })
        return periodo

    @staticmethod
    def esta_cerrado(periodo, hoy=None):
        # localdate() respeta TIME_ZONE; datetime.now() devolvería hora del servidor
        # sin zona y, con USE_TZ=True, no es comparable con fechas del calendario escolar.
        hoy = hoy or timezone.localdate()
        return hoy > periodo.fechaFin

    @classmethod
    def validar_periodo_abierto(cls, periodo):
        """Regla 5: escritura prohibida (403) una vez pasada la fecha fin del período."""
        if cls.esta_cerrado(periodo):
            raise PermissionDenied(
                f'El período "{periodo.nombre}" cerró el {periodo.fechaFin.isoformat()}. '
                'Ya no se pueden registrar ni modificar actividades o notas.'
            )