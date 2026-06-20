from datetime import date, timedelta
from django.db.models import Count, Q, Case, When, IntegerField
from apps.asistencia.models import Asistencia, Clase, AsistenciaTipo


class EstadisticaService:
    """Servicio para calcular KPIs y estadísticas del dashboard."""

    @staticmethod
    def get_kpi_paralelo(distributivo_id, fecha_inicio=None, fecha_fin=None):
        """KPIs principales para un paralelo en un rango de fechas."""
        if not fecha_fin:
            fecha_fin = date.today()
        if not fecha_inicio:
            fecha_inicio = fecha_fin - timedelta(days=30)

        asistencias = Asistencia.objects.filter(
            clase__distributivo_asignatura_id=distributivo_id,
            clase__fecha__range=[fecha_inicio, fecha_fin]
        )

        total = asistencias.count()
        if total == 0:
            return {
                'total_registros': 0,
                'porcentaje_asistencia': 0,
                'total_asistencia': 0,
                'total_inasistencia': 0,
                'total_justificado': 0,
                'total_atrasado': 0,
                'periodo': f'{fecha_inicio} a {fecha_fin}'
            }

        stats = asistencias.values('tipo').annotate(total=Count('id'))

        resultado = {
            'total_registros': total,
            'total_asistencia': 0,
            'total_inasistencia': 0,
            'total_justificado': 0,
            'total_atrasado': 0,
            'periodo': f'{fecha_inicio} a {fecha_fin}'
        }

        for stat in stats:
            resultado[f'total_{stat["tipo"].lower()}'] = stat['total']

        resultado['porcentaje_asistencia'] = round(
            (resultado['total_asistencia'] / total) * 100, 1
        )

        return resultado

    @staticmethod
    def get_tendencia_semanal(distributivo_id, semanas=4):
        """Tendencia de asistencia por semana."""
        hoy = date.today()
        resultado = []

        for i in range(semanas - 1, -1, -1):
            fin_semana = hoy - timedelta(weeks=i)
            inicio_semana = fin_semana - timedelta(days=6)

            asistencias = Asistencia.objects.filter(
                clase__distributivo_asignatura_id=distributivo_id,
                clase__fecha__range=[inicio_semana, fin_semana]
            )

            total = asistencias.count()
            presentes = asistencias.filter(tipo=AsistenciaTipo.ASISTENCIA).count()
            porcentaje = round((presentes / total) * 100, 1) if total > 0 else 0

            resultado.append({
                'semana': f'{inicio_semana.strftime("%d/%m")} - {fin_semana.strftime("%d/%m")}',
                'total': total,
                'presentes': presentes,
                'ausentes': total - presentes,
                'porcentaje': porcentaje
            })

        return resultado

    @staticmethod
    def get_alumnos_riesgo(distributivo_id, umbral_porcentaje=10.0):
        """Alumnos que superan el umbral de inasistencias.
        
        Según requerimientos: alerta visual cuando superan 10% de inasistencias.
        """
        from apps.asistencia.models import Asistencia
        from django.db.models import F, FloatField

        # Total de clases del distributivo en el periodo actual
        total_clases = Clase.objects.filter(
            distributivo_asignatura_id=distributivo_id,
            estado='FINALIZADO'
        ).count()

        if total_clases == 0:
            return []

        # Conteo de inasistencias por matrícula
        inasistencias = Asistencia.objects.filter(
            clase__distributivo_asignatura_id=distributivo_id,
            tipo__in=[AsistenciaTipo.INASISTENCIA, AsistenciaTipo.ATRASADO]
        ).values('matricula_id').annotate(
            total_faltas=Count('id')
        ).order_by('-total_faltas')

        alumnos_riesgo = []
        for item in inasistencias:
            porcentaje = (item['total_faltas'] / total_clases) * 100
            if porcentaje >= umbral_porcentaje:
                alumnos_riesgo.append({
                    'matricula_id': item['matricula_id'],
                    'total_faltas': item['total_faltas'],
                    'total_clases': total_clases,
                    'porcentaje_inasistencia': round(porcentaje, 1),
                    'en_riesgo': True
                })

        return alumnos_riesgo

    @staticmethod
    def get_resumen_semanal_docente(distributivo_id, fecha_base=None):
        """Resumen de la semana para el dashboard del docente."""
        if not fecha_base:
            fecha_base = date.today()

        dia_semana = fecha_base.weekday()
        lunes = fecha_base - timedelta(days=dia_semana)
        domingo = lunes + timedelta(days=6)

        clases = Clase.objects.filter(
            distributivo_asignatura_id=distributivo_id,
            fecha__range=[lunes, domingo]
        ).order_by('fecha', 'hora_inicio')

        clases_data = []
        for clase in clases:
            total_alumnos = clase.asistencias.count()
            presentes = clase.asistencias.filter(tipo=AsistenciaTipo.ASISTENCIA).count()
            pendiente = total_alumnos == 0

            clases_data.append({
                'clase_id': clase.id,
                'tema': clase.tema,
                'fecha': str(clase.fecha),
                'hora_inicio': str(clase.hora_inicio),
                'hora_fin': str(clase.hora_fin),
                'estado': clase.estado,
                'total_alumnos': total_alumnos,
                'presentes': presentes,
                'ausentes': total_alumnos - presentes,
                'pendiente_registro': pendiente
            })

        return {
            'semana': f'{lunes.strftime("%d/%m/%Y")} - {domingo.strftime("%d/%m/%Y")}',
            'total_clases': len(clases_data),
            'clases_pendientes': sum(1 for c in clases_data if c['pendiente_registro']),
            'clases_registradas': sum(1 for c in clases_data if not c['pendiente_registro']),
            'clases': clases_data
        }
