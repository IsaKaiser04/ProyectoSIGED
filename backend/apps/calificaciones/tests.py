from django.test import TestCase
from decimal import Decimal

from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.models.calificacionMejora import CalificacionMejora
from apps.calificaciones.models.calificacionesMejoraTipo import CalificacionMejoraTipo
from apps.calificaciones.models.Incidencia import Incidencia
from apps.calificaciones.models.incidenciaTipo import IncidenciaTipo
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.services.calificacion_service import CalificacionService
from apps.calificaciones.services.incidencia_service import IncidenciaService


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


class EvaluacionCategoriaModelTest(TestCase):
    def test_string_representation(self):
        from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
        categoria = EvaluacionCategoria(
            nombre='Tareas',
            nota_minima=0,
            nota_maxima=10,
            periodoAcademico_id=1,
            tipo_calculo='SIMPLE',
        )
        self.assertEqual(str(categoria), 'Tareas')


class EvaluacionRubricaModelTest(TestCase):
    def test_string_representation(self):
        from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
        rubrica = EvaluacionRubrica(nombre='Rubrica prueba')
        self.assertEqual(str(rubrica), 'Rubrica prueba')


class AsignaturaEvaluacionModelTest(TestCase):
    def test_string_representation(self):
        evaluacion = AsignaturaEvaluacion(nombre='Examen Trimestral')
        self.assertEqual(str(evaluacion), 'Examen Trimestral')


class PromedioConstraintsTest(TestCase):
    def test_default_valor(self):
        promedio = Promedio()
        self.assertEqual(promedio.valor, Decimal('0.00'))


class CalificacionServiceTest(TestCase):
    def setUp(self):
        self.service = CalificacionService()

    def test_calcular_promedio_vacio(self):
        resultado = self.service.calcular_promedio([])
        self.assertEqual(resultado, Decimal('0.00'))

    def test_calcular_estado_final_aprobado(self):
        estado = self.service.calcular_estado_final(Decimal('8.00'))
        self.assertEqual(estado, 'APROBADO')

    def test_calcular_estado_final_reprobado(self):
        estado = self.service.calcular_estado_final(Decimal('5.00'))
        self.assertEqual(estado, 'REPROBADO')
