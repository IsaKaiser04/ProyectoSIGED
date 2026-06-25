from django.db.models import Prefetch

from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico


class CalificacionRepository:

    def obtener_estudiantes_por_paralelo(self, paralelo_id):
        return (
            Calificacion.objects
            .filter(matricula__paralelo_id=paralelo_id)
            .select_related(
                'matricula__estudiante',
                'asignatura_evaluacion__distributivo_asignatura__asignatura_ofertada',
            )
            .distinct('matricula__estudiante_id')
        )

    def obtener_calificaciones_por_periodo(self, matricula_id, periodo_academico_id):
        return Calificacion.objects.filter(
            matricula_id=matricula_id,
            asignatura_evaluacion__periodo_academico_id=periodo_academico_id,
        ).select_related('asignatura_evaluacion')

    def obtener_promedios_por_asignatura(self, distributivo_asignatura_id):
        return Promedio.objects.filter(
            distributivo_asignatura_id=distributivo_asignatura_id,
        ).select_related('matricula__estudiante')

    def obtener_historico_estudiante(self, estudiante_id):
        return CalificacionHistorico.objects.filter(
            calificacion__matricula__estudiante_id=estudiante_id,
        ).select_related(
            'calificacion__asignatura_evaluacion__distributivo_asignatura__asignatura_ofertada',
        ).order_by('-fecha_registro')
