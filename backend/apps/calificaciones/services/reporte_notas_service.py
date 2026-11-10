"""
Reporte de notas por asignatura y paralelo (solo lectura, sin modelos propios).

Resume la misma matriz que ve el docente (MatrizService.construir_matriz), pero
solo con las actividades cuya fecha de entrega ya llegó:
  - promedio del curso a la fecha (promedio de las notas finales parciales),
  - % de estudiantes en cada nivel cualitativo (la escala de PromedioService),
  - notas pendientes: actividades ya entregadas que aún no tienen nota.

El docente ve su distributivo; Autoridad y Secretaría, todo el año de su institución.
"""
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework.exceptions import NotFound

from apps.calificaciones.repositories.matriz_repository import MatrizRepository
from apps.calificaciones.services.matriz_service import MatrizService
from apps.calificaciones.services.promedio_service import ESCALA_CUALITATIVA, PromedioService
from apps.calificaciones.services.rubrica_service import RubricaService
from apps.planificacion.models import AnioLectivo

NIVELES = [etiqueta for _, etiqueta in ESCALA_CUALITATIVA]
CENTESIMA = Decimal('0.01')
DECIMA = Decimal('0.1')


# ---------------------------------------------------------------------- #
# Cálculo puro (sin BD)
# ---------------------------------------------------------------------- #
def semana(inicio, fin, hoy):
    """Semana actual dentro de [inicio, fin]: {'actual', 'total'}. 0 si aún no empieza."""
    total = max(1, ((fin - inicio).days // 7) + 1)
    if hoy < inicio:
        actual = 0
    elif hoy > fin:
        actual = total
    else:
        actual = min(total, ((hoy - inicio).days // 7) + 1)
    return {'actual': actual, 'total': total}


def anio_vigente(anios, hoy):
    """El año que contiene `hoy`; si ninguno, el que empezó más recientemente."""
    anios = list(anios)
    for a in anios:
        if a.fechaInicio <= hoy <= a.fechaFin:
            return a
    return max(anios, key=lambda a: a.fechaInicio, default=None)


def periodo_actual(periodos, hoy):
    """El período que contiene `hoy` (dicts de la matriz con fechas ISO), o None."""
    iso = hoy.isoformat()
    return next((p for p in periodos if p['fecha_inicio'] <= iso <= p['fecha_fin']), None)


def resumen_curso(matriz, hoy):
    """
    Resume una matriz construida con `hasta=hoy`.

    Las notas pendientes se cuentan solo sobre actividades con fecha de entrega
    (las de la matriz ya vienen filtradas hasta hoy).
    """
    estudiantes = matriz['estudiantes']
    actividades = [a for p in matriz['periodos'] for a in p['actividades']]
    iso = hoy.isoformat()
    vencidas = [str(a['id']) for a in actividades if a['fecha_entrega'] and a['fecha_entrega'] <= iso]

    finales = [Decimal(str(e['nota_final'])) for e in estudiantes if e['nota_final'] is not None]
    conteo = {nivel: 0 for nivel in NIVELES}
    for valor in finales:
        conteo[PromedioService.cualitativa(valor)] += 1

    promedio = None
    if finales:
        promedio = (sum(finales, Decimal('0')) / len(finales)).quantize(CENTESIMA, rounding=ROUND_HALF_UP)

    def porcentaje(cantidad):
        if not finales:
            return 0.0
        return float((Decimal(cantidad * 100) / len(finales)).quantize(DECIMA, rounding=ROUND_HALF_UP))

    return {
        'estudiantes': len(estudiantes),
        'actividades': len(actividades),
        'con_nota': len(finales),
        'promedio': None if promedio is None else float(promedio),
        'cualitativa': PromedioService.cualitativa(promedio),
        'distribucion': [
            {'nivel': nivel, 'cantidad': conteo[nivel], 'porcentaje': porcentaje(conteo[nivel])}
            for nivel in NIVELES
        ],
        'notas_pendientes': sum(1 for e in estudiantes for aid in vencidas if aid not in e['notas']),
    }


# ---------------------------------------------------------------------- #
# Servicio
# ---------------------------------------------------------------------- #
class ReporteNotasService:

    def __init__(self, repository=None):
        self.repo = repository or MatrizRepository()
        self.matrices = MatrizService(self.repo)

    def reporte_docente(self, docente, anio_lectivo_id=None, hoy=None):
        hoy = hoy or timezone.localdate()
        asignaturas = list(self.repo.asignaturas_del_docente(docente, anio_lectivo_id))
        anio = anio_vigente({da.distributivo.anio_lectivo for da in asignaturas if da.distributivo.anio_lectivo}, hoy)
        asignaturas = [da for da in asignaturas if anio and da.distributivo.anio_lectivo_id == anio.id]
        return self._reporte(anio, asignaturas, hoy, docente=docente)

    def reporte_institucion(self, user, anio_lectivo_id=None, hoy=None):
        hoy = hoy or timezone.localdate()
        institucion_id = RubricaService.institucion_del_usuario(user)
        anios = AnioLectivo.objects.filter(institucion_id=institucion_id) if institucion_id else AnioLectivo.objects.none()
        if anio_lectivo_id:
            anio = anios.filter(pk=anio_lectivo_id).first()
            if anio is None:
                raise NotFound('Año lectivo no encontrado en tu institución.')
        else:
            anio = anio_vigente(anios, hoy)
        asignaturas = list(self.repo.asignaturas_del_anio(anio.id)) if anio else []
        return self._reporte(anio, asignaturas, hoy)

    def _reporte(self, anio, asignaturas, hoy, docente=None):
        filas = []
        periodos, rubrica_configurada = [], False
        for da in asignaturas:
            matriz = self.matrices.construir_matriz(da, list(self.repo.matriculas_del_curso(da)), hasta=hoy)
            periodos = matriz['periodos'] or periodos
            rubrica_configurada = rubrica_configurada or matriz['rubrica']['configurada']
            filas.append(self._fila(da, matriz, hoy, docente))

        filas.sort(key=lambda f: (f['grado']['nombre'] or '', f['paralelo'] or '', f['asignatura'] or ''))
        actual = periodo_actual(periodos, hoy)
        return {
            'anio_lectivo': {'id': anio.id, 'nombre': anio.nombre} if anio else None,
            'fecha': hoy.isoformat(),
            'semana_anio': semana(anio.fechaInicio, anio.fechaFin, hoy) if anio else None,
            'periodo_actual': {
                'id': actual['id'],
                'nombre': actual['nombre'],
                'semana': semana(
                    date.fromisoformat(actual['fecha_inicio']),
                    date.fromisoformat(actual['fecha_fin']),
                    hoy,
                ),
            } if actual else None,
            'niveles': NIVELES,
            'rubrica_configurada': rubrica_configurada,
            'asignaturas': filas,
            'totales': {
                'asignaturas': len(filas),
                'estudiantes': sum(f['estudiantes'] for f in filas),
                'notas_pendientes': sum(f['notas_pendientes'] for f in filas),
            },
        }

    @staticmethod
    def _fila(da, matriz, hoy, docente=None):
        ao = da.asignatura_ofertada
        docente = docente or da.distributivo.docente
        return {
            'distributivo_asignatura_id': da.id,
            'asignatura': ao.nombre if ao else None,
            'grado': {
                'id': ao.gradoOfertado_id if ao else None,
                'nombre': ao.gradoOfertado.nombre if ao else None,
            },
            'paralelo': da.paralelo.nombre if da.paralelo else None,
            'docente': f'{docente.nombres} {docente.apellidos}' if docente else None,
            **resumen_curso(matriz, hoy),
        }
