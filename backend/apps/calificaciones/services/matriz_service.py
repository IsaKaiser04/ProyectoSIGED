from collections import defaultdict

from rest_framework.exceptions import NotFound

from apps.calificaciones.repositories.matriz_repository import MatrizRepository
from apps.calificaciones.services.periodo_service import PeriodoService
from apps.calificaciones.services.promedio_service import (
    ConfiguracionPeriodoInvalida,
    NOTA_MINIMA_APROBACION,
    PromedioService,
)


def _num(valor):
    """Decimal -> float para el JSON (DRF serializaría Decimal como string)."""
    return None if valor is None else float(valor)


class MatrizService:

    def __init__(self, repository=None):
        self.repo = repository or MatrizRepository()

    # ------------------------------------------------------------------ #
    # Tarjetas de materias del docente
    # ------------------------------------------------------------------ #
    def listar_asignaturas_docente(self, docente, anio_lectivo_id=None):
        resultado = []
        for da in self.repo.asignaturas_del_docente(docente, anio_lectivo_id):
            ao = da.asignatura_ofertada
            grado = ao.gradoOfertado.grado if ao else None
            anio = da.distributivo.anio_lectivo
            resultado.append({
                'id': da.id,
                'asignatura': {'nombre': ao.nombre if ao else 'Sin asignatura'},
                'grado': {
                    'nombre': ao.gradoOfertado.nombre if ao else None,
                    'nivel': grado.nivel if grado else None,
                },
                'paralelo': {'nombre': da.paralelo.nombre if da.paralelo else None},
                'anio_lectivo': {'id': anio.id, 'nombre': anio.nombre} if anio else None,
                'institucion': {'nombre': anio.institucion.nombre} if anio and anio.institucion else None,
                'cantidad_estudiantes': self.repo.contar_estudiantes(da),
            })
        return {'distributivos': resultado, 'total': len(resultado)}

    # ------------------------------------------------------------------ #
    # Matriz: estudiantes x actividades (+ promedios, final, supletorio)
    # ------------------------------------------------------------------ #
    def obtener_matriz(self, docente, distributivo_asignatura_id):
        da = self.repo.obtener_asignatura_del_docente(docente, distributivo_asignatura_id)
        if da is None:
            # Misma respuesta si no existe o es de otro docente: no filtra existencia.
            raise NotFound('Asignatura no encontrada en tu distributivo.')
        return self.construir_matriz(da, list(self.repo.matriculas_del_curso(da)))

    def fila_estudiante(self, distributivo_asignatura, matricula):
        """Una sola fila de la matriz (la devuelven los endpoints de escritura)."""
        data = self.construir_matriz(distributivo_asignatura, [matricula])
        return data['estudiantes'][0] if data['estudiantes'] else None

    def construir_matriz(self, da, matriculas):
        matricula_ids = [m.id for m in matriculas]
        actividades = self.repo.actividades(da)
        periodos = list(self.repo.periodos_del_anio(da.distributivo.anio_lectivo_id))

        # --- índices en memoria: 5 consultas en total, sin N+1 ---
        acts_por_periodo = defaultdict(list)
        for a in actividades:
            acts_por_periodo[a.periodo_academico_id].append(a)

        notas = defaultdict(dict)           # matricula_id -> {actividad_id: Calificacion}
        for c in self.repo.calificaciones([a.id for a in actividades], matricula_ids):
            notas[c.matricula_id][c.asignatura_evaluacion_id] = c

        supletorios = {s.matricula_id: s for s in self.repo.supletorios(da, matricula_ids)}

        # --- bloque de períodos (cabeceras de la matriz) ---
        periodos_json, periodos_invalidos = [], {}
        for p in periodos:
            acts = acts_por_periodo.get(p.id, [])
            error = None
            if acts:
                try:
                    if {a.tipo_calculo for a in acts} == {'PONDERADO'}:
                        PromedioService.validar_pesos(acts)
                    elif len({a.tipo_calculo for a in acts}) > 1:
                        raise ConfiguracionPeriodoInvalida('Tipos de cálculo mezclados.')
                except ConfiguracionPeriodoInvalida as e:
                    error = e.detalle
                    periodos_invalidos[p.id] = error
            periodos_json.append({
                'id': p.id,
                'orden': p.orden,
                'nombre': p.nombre,
                'fecha_inicio': p.fechaInicio.isoformat(),
                'fecha_fin': p.fechaFin.isoformat(),
                'cerrado': PeriodoService.esta_cerrado(p),   # el front deshabilita edición
                'tipo_calculo': acts[0].tipo_calculo if acts else None,
                'error_configuracion': error,
                'actividades': [
                    {
                        'id': a.id,
                        'nombre': a.nombre,
                        'descripcion': a.descripcion,
                        'tipo_calculo': a.tipo_calculo,
                        'fecha_entrega': a.fecha_entrega.isoformat() if a.fecha_entrega else None,
                        'peso': _num(a.peso),
                    }
                    for a in acts
                ],
            })

        # --- filas de estudiantes ---
        estudiantes_json = []
        for m in matriculas:
            notas_m = notas.get(m.id, {})
            valores = {aid: c.valor for aid, c in notas_m.items()}

            promedios = {}
            for p in periodos:
                if p.id in periodos_invalidos:
                    promedios[p.id] = None
                else:
                    promedios[p.id] = PromedioService.calcular_promedio_periodo(
                        acts_por_periodo.get(p.id, []), valores
                    )

            final, completo = PromedioService.calcular_nota_final(promedios.values(), len(periodos))
            supl = supletorios.get(m.id)
            est = m.estudiante
            estudiantes_json.append({
                'matricula_id': m.id,
                'estudiante_id': est.id,
                'nombres': est.nombres,
                'apellidos': est.apellidos,
                'identificacion': est.identificacion,
                'notas': {
                    str(aid): {
                        'calificacion_id': c.id,
                        'valor': _num(c.valor),
                        'cualitativa': PromedioService.cualitativa(c.valor),
                    }
                    for aid, c in notas_m.items()
                },
                'promedios_periodo': {
                    str(pid): {'valor': _num(v), 'cualitativa': PromedioService.cualitativa(v)}
                    for pid, v in promedios.items()
                },
                'nota_final': _num(final),
                'cualitativa_final': PromedioService.cualitativa(final),
                'nota_final_completa': completo,
                'supletorio_habilitado': PromedioService.supletorio_habilitado(final, completo),
                'supletorio': _num(supl.valor) if supl else None,
                'estado_final': PromedioService.estado_final(
                    final, completo, supl.valor if supl else None
                ),
            })

        ao = da.asignatura_ofertada
        anio = da.distributivo.anio_lectivo
        return {
            'asignatura': {
                'id': da.id,
                'nombre': ao.nombre if ao else None,
                'grado': ao.gradoOfertado.nombre if ao else None,
                'paralelo': da.paralelo.nombre if da.paralelo else None,
                'anio_lectivo': {'id': anio.id, 'nombre': anio.nombre} if anio else None,
            },
            'nota_minima_aprobacion': _num(NOTA_MINIMA_APROBACION),
            # El reporte anual y el supletorio solo se editan con todos los períodos cerrados.
            'anio_cerrado': bool(periodos) and all(PeriodoService.esta_cerrado(p) for p in periodos),
            'periodos': periodos_json,
            'estudiantes': estudiantes_json,
        }