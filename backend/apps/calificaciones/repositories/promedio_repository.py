from django.db.models import Avg, Sum

from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria
from apps.calificaciones.models.calificacion import Calificacion


class PromedioRepository:

    def obtener_promedio_estudiante_asignatura(self, matricula_id, distributivo_asignatura_id):
        try:
            return Promedio.objects.get(
                matricula_id=matricula_id,
                distributivo_asignatura_id=distributivo_asignatura_id,
            )
        except Promedio.DoesNotExist:
            return None

    def obtener_resumen_estudiante(self, matricula_id):
        promedios = Promedio.objects.filter(matricula_id=matricula_id)
        return {
            'promedio_general': promedios.aggregate(Avg('valor'))['valor__avg'],
            'total_asignaturas': promedios.count(),
        }

    def obtener_calificaciones_por_categoria(self, promedio_id):
        return PromedioCategoria.objects.filter(
            promedio_id=promedio_id,
        ).select_related('evaluacion_categoria')
