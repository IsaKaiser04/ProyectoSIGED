from datetime import date
from decimal import Decimal

from django.test import SimpleTestCase, TestCase
from rest_framework.exceptions import ValidationError

from apps.calificaciones.models.calificacionesMejoraTipo import CalificacionMejoraTipo
from apps.calificaciones.models.incidenciaTipo import IncidenciaTipo
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.services.incidencia_service import IncidenciaService
from apps.calificaciones.services.promedio_service import PromedioService
from apps.calificaciones.services.reporte_notas_service import anio_vigente, resumen_curso, semana
from apps.calificaciones.services.rubrica_service import RubricaService


class CalificacionMejoraTipoTest(TestCase):
    def test_tipos_disponibles(self):
        self.assertIn('REFUERZO', CalificacionMejoraTipo.values)
        self.assertIn('PEDAGOGICO', CalificacionMejoraTipo.values)
        self.assertIn('MEJORA', CalificacionMejoraTipo.values)


class IncidenciaTipoTest(TestCase):
    def test_tipos_disponibles(self):
        self.assertIn('COMPORTAMIENTO', IncidenciaTipo.values)
        self.assertIn('ACADEMICO', IncidenciaTipo.values)
        self.assertIn('ASISTENCIAL', IncidenciaTipo.values)


class IncidenciaServiceTest(TestCase):
    def setUp(self):
        self.service = IncidenciaService()

    def test_registrar_incidencia_basica(self):
        incidencia = self.service.registrar_incidencia(
            asunto='Reporte de prueba',
            detalle='Estudiante no entregó tarea',
        )
        self.assertEqual(incidencia.asunto, 'Reporte de prueba')
        self.assertEqual(incidencia.tipo, IncidenciaTipo.COMPORTAMIENTO)
        self.assertFalse(incidencia.notificar)

    def test_registrar_incidencia_academica(self):
        incidencia = self.service.registrar_incidencia(
            asunto='Bajo rendimiento',
            detalle='Nota debajo del mínimo',
            tipo=IncidenciaTipo.ACADEMICO,
            notificar=True,
        )
        self.assertEqual(incidencia.tipo, IncidenciaTipo.ACADEMICO)
        self.assertTrue(incidencia.notificar)


class EvaluacionCategoriaModelTest(SimpleTestCase):
    def test_string_representation(self):
        from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
        categoria = EvaluacionCategoria(nombre='Tareas', peso=Decimal('0.25'))
        self.assertEqual(str(categoria), 'Tareas')


class EvaluacionRubricaModelTest(SimpleTestCase):
    def test_string_representation(self):
        from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
        rubrica = EvaluacionRubrica(nombre='Rubrica prueba')
        self.assertEqual(str(rubrica), 'Rubrica prueba')


class AsignaturaEvaluacionModelTest(SimpleTestCase):
    def test_string_representation(self):
        evaluacion = AsignaturaEvaluacion(nombre='Examen Trimestral')
        self.assertEqual(str(evaluacion), 'Examen Trimestral')


class PromedioConstraintsTest(SimpleTestCase):
    def test_default_valor(self):
        promedio = Promedio()
        self.assertEqual(promedio.valor, Decimal('0.00'))


# --------------------------------------------------------------------------- #
# Rúbrica de actividades: nota del período = Σ (promedio de la sección × peso)
# --------------------------------------------------------------------------- #
class _Seccion:
    def __init__(self, id, peso):
        self.id, self.peso = id, Decimal(peso)


class _Actividad:
    def __init__(self, id, seccion_id):
        self.id, self.evaluacion_categoria_id = id, seccion_id


class PromedioPeriodoTest(SimpleTestCase):
    # Actividades en clase 25 %, Tareas 25 %, Lecciones 20 %, Evaluación 30 %
    secciones = [_Seccion(1, '0.25'), _Seccion(2, '0.25'), _Seccion(3, '0.20'), _Seccion(4, '0.30')]

    def test_ejemplo_de_la_propuesta(self):
        actividades = [_Actividad(10, 1), _Actividad(11, 1), _Actividad(12, 1),
                       _Actividad(20, 2), _Actividad(21, 2), _Actividad(30, 3), _Actividad(40, 4)]
        notas = {10: Decimal('8'), 11: Decimal('9'), 12: Decimal('10'),
                 20: Decimal('7'), 21: Decimal('9'), 30: Decimal('6'), 40: Decimal('8')}
        valor, por_seccion = PromedioService.calcular_promedio_periodo(self.secciones, actividades, notas)
        self.assertEqual(valor, Decimal('7.85'))
        self.assertEqual(por_seccion[1], Decimal('9.00'))
        self.assertEqual(por_seccion[2], Decimal('8.00'))

    def test_seccion_sin_actividades_reparte_su_peso(self):
        # Sin lecciones (20 %): el 80 % restante pasa a valer el 100 %.
        actividades = [_Actividad(10, 1), _Actividad(20, 2), _Actividad(40, 4)]
        notas = {10: Decimal('10'), 20: Decimal('10'), 40: Decimal('10')}
        valor, por_seccion = PromedioService.calcular_promedio_periodo(self.secciones, actividades, notas)
        self.assertEqual(valor, Decimal('10.00'))
        self.assertNotIn(3, por_seccion)

    def test_actividad_sin_nota_cuenta_cero(self):
        actividades = [_Actividad(10, 1), _Actividad(11, 1)]
        valor, _ = PromedioService.calcular_promedio_periodo(self.secciones, actividades, {10: Decimal('8')})
        self.assertEqual(valor, Decimal('4.00'))

    def test_sin_actividades_no_hay_promedio(self):
        valor, por_seccion = PromedioService.calcular_promedio_periodo(self.secciones, [], {})
        self.assertIsNone(valor)
        self.assertEqual(por_seccion, {})

    def test_actividad_fuera_de_la_rubrica_no_cuenta(self):
        actividades = [_Actividad(10, 1), _Actividad(99, None)]
        valor, _ = PromedioService.calcular_promedio_periodo(
            self.secciones, actividades, {10: Decimal('8'), 99: Decimal('0')}
        )
        self.assertEqual(valor, Decimal('8.00'))


class NotaFinalTest(SimpleTestCase):
    def test_promedio_de_los_periodos(self):
        valor, completo = PromedioService.calcular_nota_final(
            [Decimal('8'), Decimal('7'), Decimal('6')], 3
        )
        self.assertEqual(valor, Decimal('7.00'))
        self.assertTrue(completo)

    def test_periodo_sin_promedio_deja_el_anio_incompleto(self):
        _, completo = PromedioService.calcular_nota_final([Decimal('8'), None, None], 3)
        self.assertFalse(completo)


class EstadoFinalTest(SimpleTestCase):
    def test_aprobado(self):
        self.assertEqual(PromedioService.estado_final(Decimal('8.00'), True), 'APROBADO')

    def test_supletorio(self):
        self.assertEqual(PromedioService.estado_final(Decimal('5.00'), True), 'SUPLETORIO')

    def test_supletorio_aprobado(self):
        self.assertEqual(PromedioService.estado_final(Decimal('5.00'), True, Decimal('7.50')), 'APROBADO')

    def test_en_curso_si_falta_algo(self):
        self.assertEqual(PromedioService.estado_final(Decimal('5.00'), False), 'EN_CURSO')


class RubricaValidacionTest(SimpleTestCase):
    def _datos(self, *pesos):
        return [{'nombre': f'Sección {i}', 'peso': Decimal(p), 'orden': i} for i, p in enumerate(pesos)]

    def test_pesos_que_suman_100(self):
        RubricaService._validar_datos(self._datos('0.25', '0.25', '0.20', '0.30'))

    def test_pesos_que_no_suman_100(self):
        with self.assertRaises(ValidationError):
            RubricaService._validar_datos(self._datos('0.25', '0.25'))

    def test_peso_cero(self):
        with self.assertRaises(ValidationError):
            RubricaService._validar_datos(self._datos('1', '0'))

    def test_nombres_repetidos(self):
        datos = self._datos('0.50', '0.50')
        datos[1]['nombre'] = ' sección 0 '
        with self.assertRaises(ValidationError):
            RubricaService._validar_datos(datos)

    def test_sin_secciones(self):
        with self.assertRaises(ValidationError):
            RubricaService._validar_datos([])


# --------------------------------------------------------------------------- #
# Reporte de notas: resumen por asignatura y paralelo
# --------------------------------------------------------------------------- #
class SemanaTest(SimpleTestCase):
    inicio, fin = date(2026, 9, 1), date(2027, 6, 30)

    def test_primera_semana(self):
        self.assertEqual(semana(self.inicio, self.fin, date(2026, 9, 3))['actual'], 1)

    def test_semana_diez(self):
        self.assertEqual(semana(self.inicio, self.fin, date(2026, 11, 3))['actual'], 10)

    def test_antes_y_despues_del_rango(self):
        total = semana(self.inicio, self.fin, self.inicio)['total']
        self.assertEqual(semana(self.inicio, self.fin, date(2026, 8, 1))['actual'], 0)
        self.assertEqual(semana(self.inicio, self.fin, date(2027, 8, 1))['actual'], total)


class _Anio:
    def __init__(self, inicio, fin):
        self.fechaInicio, self.fechaFin = inicio, fin


class AnioVigenteTest(SimpleTestCase):
    def test_el_que_contiene_hoy(self):
        actual, siguiente = _Anio(date(2026, 9, 1), date(2027, 6, 30)), _Anio(date(2027, 9, 1), date(2028, 6, 30))
        self.assertIs(anio_vigente([siguiente, actual], date(2026, 11, 9)), actual)

    def test_sin_coincidencia_el_mas_reciente(self):
        viejo, nuevo = _Anio(date(2024, 9, 1), date(2025, 6, 30)), _Anio(date(2025, 9, 1), date(2026, 6, 30))
        self.assertIs(anio_vigente([viejo, nuevo], date(2026, 8, 1)), nuevo)

    def test_sin_anios(self):
        self.assertIsNone(anio_vigente([], date(2026, 8, 1)))


class ResumenCursoTest(SimpleTestCase):
    hoy = date(2026, 11, 9)
    matriz = {
        'periodos': [{'actividades': [
            {'id': 1, 'fecha_entrega': '2026-10-01'},
            {'id': 2, 'fecha_entrega': '2026-11-09'},
        ]}],
        'estudiantes': [
            {'nota_final': 9.5, 'notas': {'1': {}, '2': {}}},    # Excelente
            {'nota_final': 7.0, 'notas': {'1': {}}},             # Muy bueno, 1 pendiente
            {'nota_final': 3.0, 'notas': {}},                    # Insuficiente, 2 pendientes
            {'nota_final': None, 'notas': {}},                   # sin nota, 2 pendientes
        ],
    }

    def test_promedio_y_niveles(self):
        r = resumen_curso(self.matriz, self.hoy)
        self.assertEqual(r['estudiantes'], 4)
        self.assertEqual(r['con_nota'], 3)
        self.assertEqual(r['promedio'], 6.5)
        self.assertEqual(r['cualitativa'], 'Regular')
        porcentajes = {d['nivel']: d['porcentaje'] for d in r['distribucion']}
        self.assertEqual(porcentajes, {'Excelente': 33.3, 'Muy bueno': 33.3, 'Regular': 0.0, 'Insuficiente': 33.3})

    def test_notas_pendientes_y_actividades(self):
        r = resumen_curso(self.matriz, self.hoy)
        self.assertEqual(r['actividades'], 2)
        self.assertEqual(r['notas_pendientes'], 5)

    def test_curso_sin_notas(self):
        r = resumen_curso({'periodos': [], 'estudiantes': []}, self.hoy)
        self.assertIsNone(r['promedio'])
        self.assertEqual(r['cualitativa'], '')
        self.assertTrue(all(d['porcentaje'] == 0.0 for d in r['distribucion']))
