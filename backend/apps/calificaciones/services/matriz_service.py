from collections import defaultdict

from rest_framework.exceptions import NotFound

from apps.calificaciones.repositories.matriz_repository import MatrizRepository
from apps.calificaciones.services.periodo_service import PeriodoService
from apps.calificaciones.services.promedio_service import (
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

    def construir_matriz(self, da, matriculas, hasta=None):
        """
        :param hasta: fecha opcional. Si se pasa, solo cuentan las actividades con fecha de
            entrega hasta ese día (lo usa el reporte de notas para el "promedio a la fecha").
        """
        matricula_ids = [m.id for m in matriculas]
        anio_id = da.distributivo.anio_lectivo_id
        secciones = PromedioService.secciones_del_anio(anio_id)
        orden_seccion = {s.id: i for i, s in enumerate(secciones)}
        # Solo cuentan las actividades de una sección de la rúbrica del año.
        actividades = [
            a for a in self.repo.actividades(da)
            if a.evaluacion_categoria_id in orden_seccion
            and (hasta is None or a.fecha_entrega is None or a.fecha_entrega <= hasta)
        ]
        periodos = list(self.repo.periodos_del_anio(anio_id))

        # --- índices en memoria: 6 consultas en total, sin N+1 ---
        def orden_actividad(a):
            fecha = a.fecha_entrega.isoformat() if a.fecha_entrega else ''
            return orden_seccion[a.evaluacion_categoria_id], fecha, a.id

        acts_por_periodo = defaultdict(list)
        for a in sorted(actividades, key=orden_actividad):
            acts_por_periodo[a.periodo_academico_id].append(a)

        notas = defaultdict(dict)           # matricula_id -> {actividad_id: Calificacion}
        for c in self.repo.calificaciones([a.id for a in actividades], matricula_ids):
            notas[c.matricula_id][c.asignatura_evaluacion_id] = c

        supletorios = {s.matricula_id: s for s in self.repo.supletorios(da, matricula_ids)}

        # --- bloque de períodos (cabeceras de la matriz) ---
        periodos_json = []
        for p in periodos:
            periodos_json.append({
                'id': p.id,
                'orden': p.orden,
                'nombre': p.nombre,
                'fecha_inicio': p.fechaInicio.isoformat(),
                'fecha_fin': p.fechaFin.isoformat(),
                'cerrado': PeriodoService.esta_cerrado(p),   # el front deshabilita edición
                'actividades': [
                    {
                        'id': a.id,
                        'nombre': a.nombre,
                        'descripcion': a.descripcion,
                        'seccion_id': a.evaluacion_categoria_id,
                        'fecha_entrega': a.fecha_entrega.isoformat() if a.fecha_entrega else None,
                    }
                    for a in acts_por_periodo.get(p.id, [])
                ],
            })

        # --- filas de estudiantes ---
        estudiantes_json = []
        for m in matriculas:
            notas_m = notas.get(m.id, {})
            valores = {aid: c.valor for aid, c in notas_m.items()}

            promedios, promedios_seccion = {}, {}
            for p in periodos:
                promedios[p.id], promedios_seccion[p.id] = PromedioService.calcular_promedio_periodo(
                    secciones, acts_por_periodo.get(p.id, []), valores
                )

            # Una actividad sin nota cuenta como 0, pero mientras haya pendientes el año
            # no está completo y el supletorio no se habilita.
            pendientes = sum(1 for a in actividades if a.id not in notas_m)
            final, periodos_completos = PromedioService.calcular_nota_final(promedios.values(), len(periodos))
            completo = periodos_completos and pendientes == 0
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
                'promedios_seccion': {
                    str(pid): {
                        str(sid): {'valor': _num(v), 'cualitativa': PromedioService.cualitativa(v)}
                        for sid, v in por_seccion.items()
                    }
                    for pid, por_seccion in promedios_seccion.items()
                },
                'notas_pendientes': pendientes,
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
            # Rúbrica del año: igual para todos los períodos y grados.
            'rubrica': {
                'configurada': bool(secciones),
                'secciones': [
                    {'id': s.id, 'nombre': s.nombre, 'peso': _num(s.peso), 'orden': s.orden}
                    for s in secciones
                ],
            },
            # El reporte anual y el supletorio solo se editan con todos los períodos cerrados.
            'anio_cerrado': bool(periodos) and all(PeriodoService.esta_cerrado(p) for p in periodos),
            'periodos': periodos_json,
            'estudiantes': estudiantes_json,
        }