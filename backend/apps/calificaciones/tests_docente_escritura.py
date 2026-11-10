"""
Pruebas de integración de los endpoints de escritura del docente
(actividades, notas, supletorio) y de la matriz con estado_final.
"""
from datetime import date, timedelta
from decimal import Decimal
from itertools import count

from django.apps import apps
from django.db import models
from django.test import TestCase
from rest_framework.test import APIClient

from apps.actoresAcademicos.models.enums import RolTipo
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.evaluacionLibro import EvaluacionLibro

_seq = count(1)


def _crear(model, **valores):
    """Rellena los campos obligatorios con valores mínimos válidos."""
    for f in model._meta.concrete_fields:
        if f.primary_key or f.name in valores or f.null or f.has_default() or f.blank:
            continue
        if getattr(f, 'auto_now', False) or getattr(f, 'auto_now_add', False):
            continue
        n = next(_seq)
        if f.is_relation:
            valores[f.name] = _crear(f.related_model)
        elif f.choices:
            valores[f.name] = f.choices[0][0]
        elif isinstance(f, models.EmailField):
            valores[f.name] = f'u{n}@t.ec'
        elif isinstance(f, models.CharField):
            valores[f.name] = f'v{n}'[: f.max_length]
        elif isinstance(f, models.DateField):
            valores[f.name] = date(2000, 1, 1)
        elif isinstance(f, (models.IntegerField, models.DecimalField)):
            valores[f.name] = 1
        else:
            valores[f.name] = f'v{n}'
    return model.objects.create(**valores)


def M(label):
    return apps.get_model(label)


class EscrituraDocenteTests(TestCase):

    def setUp(self):
        hoy = date.today()
        self.institucion = _crear(M('institucion.Institucion'))
        self.anio = _crear(M('planificacion.AnioLectivo'), nombre='2026',
                           fechaInicio=hoy - timedelta(days=200), fechaFin=hoy + timedelta(days=200),
                           institucion=self.institucion)
        P = M('planificacion.PeriodoAcademico')
        self.p1 = _crear(P, orden='1', nombre='P1', anioLectivo=self.anio,
                         fechaInicio=hoy - timedelta(days=200), fechaFin=hoy - timedelta(days=60))
        self.p2 = _crear(P, orden='2', nombre='P2', anioLectivo=self.anio,
                         fechaInicio=hoy - timedelta(days=59), fechaFin=hoy + timedelta(days=60))
        self.p3 = _crear(P, orden='3', nombre='P3', anioLectivo=self.anio,
                         fechaInicio=hoy + timedelta(days=61), fechaFin=hoy + timedelta(days=200))

        oferta = _crear(M('planificacion.OfertaAcademica'), anioLectivo=self.anio)
        go = _crear(M('planificacion.GradoOfertado'), ofertaAcademica=oferta, nombre='Décimo')
        self.paralelo = _crear(M('planificacion.Paralelo'), nombre='A', gradoOfertado=go)
        ao = _crear(M('planificacion.AsignaturaOfertada'), gradoOfertado=go, nombre='Matemática')

        cuenta = _crear(M('actoresAcademicos.Cuenta'), rol=RolTipo.DOCENTE)
        self.docente = _crear(M('actoresAcademicos.Docente'), cuenta=cuenta, institucion=self.institucion)
        dist = _crear(M('distributivos.Distributivo'), anio_lectivo=self.anio, docente=self.docente)
        self.da = _crear(M('distributivos.DistributivoAsignatura'), distributivo=dist,
                         asignatura_ofertada=ao, paralelo=self.paralelo)

        est = _crear(M('actoresAcademicos.Estudiante'), institucion=self.institucion,
                     nombres='Ana', apellidos='Paz')
        self.matricula = _crear(M('matricula.Matricula'), estudiante=est, anio_lectivo=self.anio,
                                paralelo=self.paralelo, institucion=self.institucion, estado='Legalizada')

        # Rúbrica del año: Tareas 40 %, Evaluación 60 %
        libro = EvaluacionLibro.objects.create(nombre='Rúbrica 2026', anio_lectivo=self.anio)
        self.tareas = EvaluacionCategoria.objects.create(libro=libro, nombre='Tareas', peso=Decimal('0.40'), orden=0)
        self.evaluacion = EvaluacionCategoria.objects.create(libro=libro, nombre='Evaluación', peso=Decimal('0.60'), orden=1)

        self.client = APIClient()
        self.client.force_authenticate(user=cuenta, token={'rol': 'DOCENTE'})
        self.base = '/api/calificaciones/docente/'

    def _crear_actividad(self, seccion=None, **datos):
        datos.setdefault('evaluacion_categoria', (seccion or self.tareas).id)
        return self.client.post(f'{self.base}asignaturas/{self.da.id}/actividades/', datos, format='json')

    def _nota(self, actividad_id, valor):
        return self.client.put(f'{self.base}actividades/{actividad_id}/nota/',
                               {'matricula': self.matricula.id, 'valor': valor}, format='json')

    def test_mis_asignaturas_usa_la_vista_nueva(self):
        r = self.client.get('/api/calificaciones/distributivo/docente/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['total'], 1)
        self.assertEqual(r.data['distributivos'][0]['id'], self.da.id)

    def test_actividad_por_seccion_y_promedio_del_periodo(self):
        hoy = date.today().isoformat()
        r = self._crear_actividad(nombre='Deber 1', fecha_entrega=hoy)
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data['periodo_academico'], self.p2.id)
        self.assertEqual(r.data['evaluacion_categoria'], self.tareas.id)
        deber = r.data['id']

        r = self._nota(deber, '9.5')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['cualitativa'], 'Excelente')
        # Solo Tareas tiene actividades: su 40 % pasa a valer el 100 %.
        self.assertAlmostEqual(r.data['fila']['promedios_periodo'][str(self.p2.id)]['valor'], 9.5)

        r = self._crear_actividad(self.evaluacion, nombre='Prueba', fecha_entrega=hoy)
        self.assertEqual(r.status_code, 201, r.data)
        r = self._nota(r.data['id'], '5')
        # 9.5 × 0.40 + 5 × 0.60 = 6.80
        self.assertAlmostEqual(r.data['fila']['promedios_periodo'][str(self.p2.id)]['valor'], 6.8)
        seccion = r.data['fila']['promedios_seccion'][str(self.p2.id)]
        self.assertAlmostEqual(seccion[str(self.tareas.id)]['valor'], 9.5)

    def test_actividad_sin_seccion_valida(self):
        hoy = date.today().isoformat()
        r = self.client.post(f'{self.base}asignaturas/{self.da.id}/actividades/',
                             {'nombre': 'Sin sección', 'fecha_entrega': hoy}, format='json')
        self.assertEqual(r.status_code, 400)
        r = self._crear_actividad(nombre='Ajena', fecha_entrega=hoy, evaluacion_categoria=self.evaluacion.id + 999)
        self.assertEqual(r.status_code, 400)

    def test_periodo_cerrado_403(self):
        cerrada = (date.today() - timedelta(days=100)).isoformat()
        r = self._crear_actividad(nombre='Tarde', fecha_entrega=cerrada)
        self.assertEqual(r.status_code, 403)

        act = AsignaturaEvaluacion.objects.create(nombre='Vieja', fecha_entrega=cerrada, evaluacion_categoria=self.tareas,
                                                  distributivo_asignatura=self.da, periodo_academico=self.p1)
        r = self.client.put(f'{self.base}actividades/{act.id}/nota/', {'matricula': self.matricula.id, 'valor': '8'}, format='json')
        self.assertEqual(r.status_code, 403)
        self.assertEqual(self.client.delete(f'{self.base}actividades/{act.id}/').status_code, 403)

    def test_eliminar_es_baja_logica(self):
        r = self._crear_actividad(nombre='Borrar', fecha_entrega=date.today().isoformat())
        aid = r.data['id']
        self.client.put(f'{self.base}actividades/{aid}/nota/', {'matricula': self.matricula.id, 'valor': '5'}, format='json')
        self.assertEqual(self.client.delete(f'{self.base}actividades/{aid}/').status_code, 204)
        self.assertFalse(AsignaturaEvaluacion.objects.get(pk=aid).activo)
        matriz = self.client.get(f'{self.base}asignaturas/{self.da.id}/matriz/').data
        p2 = next(p for p in matriz['periodos'] if p['id'] == self.p2.id)
        self.assertEqual(p2['actividades'], [])

    def test_supletorio_requiere_anio_cerrado(self):
        r = self.client.put(f'{self.base}asignaturas/{self.da.id}/supletorio/', {'matricula': self.matricula.id, 'valor': '8'}, format='json')
        self.assertEqual(r.status_code, 403)
        self.assertFalse(self.client.get(f'{self.base}asignaturas/{self.da.id}/matriz/').data['anio_cerrado'])

    def test_supletorio_con_anio_cerrado(self):
        hoy = date.today()
        # Cerrar los tres períodos moviéndolos al pasado
        for i, p in enumerate([self.p1, self.p2, self.p3]):
            p.fechaInicio = hoy - timedelta(days=300 - i * 90)
            p.fechaFin = hoy - timedelta(days=211 - i * 90)
            p.save()
            act = AsignaturaEvaluacion.objects.create(
                nombre=f'A{i}', fecha_entrega=p.fechaInicio, evaluacion_categoria=self.tareas,
                distributivo_asignatura=self.da, periodo_academico=p)
            Calificacion.objects.create(asignatura_evaluacion=act, matricula=self.matricula, valor='5')

        matriz = self.client.get(f'{self.base}asignaturas/{self.da.id}/matriz/').data
        self.assertTrue(matriz['anio_cerrado'])
        fila = matriz['estudiantes'][0]
        self.assertEqual(fila['nota_final'], 5.0)
        self.assertTrue(fila['supletorio_habilitado'])
        self.assertEqual(fila['estado_final'], 'SUPLETORIO')

        url = f'{self.base}asignaturas/{self.da.id}/supletorio/'
        r = self.client.put(url, {'matricula': self.matricula.id, 'valor': '6'}, format='json')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['fila']['estado_final'], 'REPROBADO')
        r = self.client.put(url, {'matricula': self.matricula.id, 'valor': '7.5'}, format='json')
        self.assertEqual(r.data['fila']['estado_final'], 'APROBADO')
        self.assertEqual(r.data['fila']['supletorio'], 7.5)

    def test_otra_asignatura_404(self):
        r = self.client.get(f'{self.base}asignaturas/{self.da.id + 999}/matriz/')
        self.assertEqual(r.status_code, 404)

    def test_reporte_de_notas_del_docente(self):
        hoy = date.today()
        r = self._crear_actividad(nombre='Calificada', fecha_entrega=hoy.isoformat())
        self._nota(r.data['id'], '8')
        self._crear_actividad(nombre='Sin calificar', fecha_entrega=hoy.isoformat())
        # Una actividad futura no cuenta ni como 0 ni como pendiente.
        self._crear_actividad(nombre='Futura', fecha_entrega=(hoy + timedelta(days=10)).isoformat())

        r = self.client.get(f'{self.base}reporte-notas/')
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data['anio_lectivo']['id'], self.anio.id)
        self.assertEqual(r.data['periodo_actual']['id'], self.p2.id)
        self.assertEqual(r.data['totales']['notas_pendientes'], 1)

        fila = r.data['asignaturas'][0]
        self.assertEqual(fila['distributivo_asignatura_id'], self.da.id)
        self.assertEqual(fila['estudiantes'], 1)
        self.assertEqual(fila['actividades'], 2)
        self.assertEqual(fila['promedio'], 4.0)          # (8 + 0) / 2, solo Tareas
        self.assertEqual(fila['cualitativa'], 'Insuficiente')
        niveles = {d['nivel']: d['porcentaje'] for d in fila['distribucion']}
        self.assertEqual(niveles['Insuficiente'], 100.0)

    def test_reporte_de_institucion_solo_para_autoridad(self):
        r = self.client.get('/api/calificaciones/reporte-notas/')
        self.assertEqual(r.status_code, 403)
