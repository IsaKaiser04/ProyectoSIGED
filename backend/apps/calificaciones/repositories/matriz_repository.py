from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.supletorio import Supletorio
from apps.distributivos.models import DistributivoAsignatura
from apps.matricula.models import Matricula
from apps.matricula.models.enums import MatriculaEstado
from apps.planificacion.models import PeriodoAcademico


class MatrizRepository:
    """
    Regla 1 (seguridad): TODA consulta parte de `distributivo__docente=docente`.
    Nunca se busca una DistributivoAsignatura solo por id.
    """

    def asignaturas_del_docente(self, docente, anio_lectivo_id=None):
        qs = (
            DistributivoAsignatura.objects
            .filter(distributivo__docente=docente)
            .select_related(
                'distributivo__anio_lectivo',
                'asignatura_ofertada__gradoOfertado__grado',
                'asignatura_ofertada__asignatura',
                'paralelo',
            )
            .order_by('-distributivo__anio_lectivo__fechaInicio', 'asignatura_ofertada__nombre')
        )
        if anio_lectivo_id:
            qs = qs.filter(distributivo__anio_lectivo_id=anio_lectivo_id)
        return qs

    def obtener_asignatura_del_docente(self, docente, distributivo_asignatura_id):
        """None si no existe O si pertenece a otro docente (la vista responde 404 en ambos casos)."""
        return self.asignaturas_del_docente(docente).filter(pk=distributivo_asignatura_id).first()

    def matriculas_del_curso(self, distributivo_asignatura):
        """Estudiantes del paralelo con matrícula legalizada en el año lectivo del distributivo."""
        if distributivo_asignatura.paralelo_id is None:
            return Matricula.objects.none()
        return (
            Matricula.objects
            .filter(
                paralelo_id=distributivo_asignatura.paralelo_id,
                anio_lectivo_id=distributivo_asignatura.distributivo.anio_lectivo_id,
                estado=MatriculaEstado.LEGALIZADA,
                estudiante__isnull=False,   # Matricula.estudiante es nullable
            )
            .select_related('estudiante')
            .order_by('estudiante__apellidos', 'estudiante__nombres')
        )

    def contar_estudiantes(self, distributivo_asignatura):
        return self.matriculas_del_curso(distributivo_asignatura).count()

    def periodos_del_anio(self, anio_lectivo_id):
        return PeriodoAcademico.objects.filter(anioLectivo_id=anio_lectivo_id).order_by('fechaInicio')

    def actividades(self, distributivo_asignatura):
        return list(
            AsignaturaEvaluacion.objects
            .filter(distributivo_asignatura=distributivo_asignatura, activo=True)
            .order_by('fecha_entrega', 'id')
        )

    def calificaciones(self, actividad_ids, matricula_ids):
        return Calificacion.objects.filter(
            asignatura_evaluacion_id__in=actividad_ids,
            matricula_id__in=matricula_ids,
        )

    def supletorios(self, distributivo_asignatura, matricula_ids):
        return Supletorio.objects.filter(
            distributivo_asignatura=distributivo_asignatura,
            matricula_id__in=matricula_ids,
        )