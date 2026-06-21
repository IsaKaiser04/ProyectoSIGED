from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import (
    DiasSemana,
    Distributivo,
    DistributivoAsignatura,
    Horario,
    HorarioTipo,
    JornadaHora,
    PlanificacionCurricular,
    PlanificacionCurricularHistorial,
    PlanificacionEstado,
)
from .serializers import DistributivoSerializer, HorarioSerializer


class DistributivoModelTest(TestCase):
    def test_creacion_distributivo(self):
        distributivo = Distributivo.objects.create(
            anio_lectivo_referencia='2025-2026',
            docente_referencia='Docente Demo',
            observacion='Carga inicial',
        )

        self.assertEqual(str(distributivo), 'Docente Demo - 2025-2026')
        self.assertEqual(Distributivo.objects.count(), 1)


class DistributivoSerializerTest(TestCase):
    def test_serializer_valida_campos_requeridos(self):
        serializer = DistributivoSerializer(data={
            'anio_lectivo_referencia': '2025-2026',
            'docente_referencia': 'Docente Demo',
            'observacion': 'Carga inicial',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_rechaza_docente_vacio(self):
        serializer = DistributivoSerializer(data={
            'anio_lectivo_referencia': '2025-2026',
            'docente_referencia': '',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('docente_referencia', serializer.errors)


class HorarioSerializerTest(TestCase):
    def test_serializer_rechaza_hora_invalida(self):
        distributivo = Distributivo.objects.create(
            anio_lectivo_referencia='2025-2026',
            docente_referencia='Docente Demo',
        )
        asignatura = DistributivoAsignatura.objects.create(
            distributivo=distributivo,
            asignatura_ofertada_referencia='Matematicas',
        )
        jornada = JornadaHora.objects.create(
            nombre='Matutina',
            hora_inicio='07:00',
            hora_fin='12:00',
        )

        serializer = HorarioSerializer(data={
            'distributivo': distributivo.id,
            'distributivo_asignatura': asignatura.id,
            'jornada_hora': jornada.id,
            'hora_inicio': '10:00',
            'hora_fin': '09:00',
            'tipo_horario': HorarioTipo.CLASE,
            'dia_semana': DiasSemana.LUNES,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('hora_fin', serializer.errors)


class DistributivosAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.distributivo = Distributivo.objects.create(
            anio_lectivo_referencia='2025-2026',
            docente_referencia='Docente Demo',
            observacion='Inicial',
        )
        self.asignatura = DistributivoAsignatura.objects.create(
            distributivo=self.distributivo,
            asignatura_ofertada_referencia='Matematicas',
        )
        self.jornada = JornadaHora.objects.create(
            nombre='Matutina',
            hora_inicio='07:00',
            hora_fin='12:00',
            institucion_educativa_referencia='INST-UUID-1234',
        )
        self.planificacion = PlanificacionCurricular.objects.create(
            distributivo_asignatura=self.asignatura,
            observacion='Pendiente de revision',
            estado=PlanificacionEstado.BORRADOR,
        )
        self.historial = PlanificacionCurricularHistorial.objects.create(
            planificacion_curricular=self.planificacion,
            estado_anterior=PlanificacionEstado.BORRADOR,
            estado_actual=PlanificacionEstado.POR_APROBAR,
            observacion='Enviado a revision',
        )
        self.horario = Horario.objects.create(
            distributivo=self.distributivo,
            distributivo_asignatura=self.asignatura,
            jornada_hora=self.jornada,
            hora_inicio='08:00',
            hora_fin='09:00',
            observacion='Primer bloque',
            tipo_horario=HorarioTipo.CLASE,
            dia_semana=DiasSemana.LUNES,
        )

    def test_listados_principales(self):
        endpoints = [
            '/api/distributivos/',
            '/api/distributivos-asignaturas/',
            '/api/horarios/',
            '/api/jornadas/',
            '/api/planificaciones/',
            '/api/planificaciones-historial/',
        ]

        for endpoint in endpoints:
            response = self.client.get(endpoint)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filtrar_por_institucion(self):
        # Asegura que el endpoint permite filtrar por institucion_educativa_referencia
        response = self.client.get('/api/jornadas/?institucion_educativa_referencia=INST-UUID-1234')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(any(item.get('institucion_educativa_referencia') == 'INST-UUID-1234' for item in data))

    def test_crear_distributivo(self):
        response = self.client.post('/api/distributivos/', {
            'anio_lectivo_referencia': '2026-2027',
            'docente_referencia': 'Nuevo Docente',
            'observacion': 'Creado por API',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Distributivo.objects.count(), 2)

    def test_crear_jornada(self):
        response = self.client.post('/api/jornadas/', {
            'nombre': 'Vespertina',
            'hora_inicio': '13:00',
            'hora_fin': '18:00',
            'institucion_educativa_referencia': 'INST-API-0001',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_crear_horario(self):
        response = self.client.post('/api/horarios/', {
            'distributivo': self.distributivo.id,
            'distributivo_asignatura': self.asignatura.id,
            'jornada_hora': self.jornada.id,
            'hora_inicio': '09:00',
            'hora_fin': '10:00',
            'observacion': 'Bloque 2',
            'tipo_horario': HorarioTipo.COMPLEMENTARIA,
            'dia_semana': DiasSemana.MARTES,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_actualizar_planificacion(self):
        response = self.client.put(f'/api/planificaciones/{self.planificacion.id}/', {
            'distributivo_asignatura': self.asignatura.id,
            'observacion': 'Actualizada',
            'estado': PlanificacionEstado.POR_APROBAR,
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_eliminar_historial(self):
        response = self.client.delete(f'/api/planificaciones-historial/{self.historial.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(PlanificacionCurricularHistorial.objects.count(), 0)
