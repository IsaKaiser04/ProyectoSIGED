from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from apps.distributivos.models import (
    Distributivo,
    JornadaHora,
    DistributivoAsignatura,
    Horario,
    PlanificacionCurricular,
    PlanificacionCurricularHistorial,
)


class DistributivosAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_distributivo_list_and_create(self):
        resp = self.client.get('/api/distributivos/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = {'anio_lectivo_referencia': '2026', 'docente_referencia': 'Profesor Test', 'observacion': ''}
        resp = self.client.post('/api/distributivos/', data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', resp.data)

    def test_jornada_list_and_create(self):
        resp = self.client.get('/api/jornadas/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        data = {'nombre': 'Mañana', 'hora_inicio': '08:00', 'hora_fin': '12:00', 'institucion_educativa_referencia': 'I.E. Prueba'}
        resp = self.client.post('/api/jornadas/', data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_distributivo_asignatura_create(self):
        d = Distributivo.objects.create(anio_lectivo_referencia='2026', docente_referencia='D')
        data = {'distributivo': d.id, 'asignatura_ofertada_referencia': 'Matemáticas', 'observacion': ''}
        resp = self.client.post('/api/distributivos-asignaturas/', data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_horario_create(self):
        d = Distributivo.objects.create(anio_lectivo_referencia='2026', docente_referencia='D')
        j = JornadaHora.objects.create(nombre='Tarde', hora_inicio='13:00', hora_fin='17:00')
        da = DistributivoAsignatura.objects.create(distributivo=d, asignatura_ofertada_referencia='Ciencias')
        data = {
            'distributivo': d.id,
            'distributivo_asignatura': da.id,
            'jornada_hora': j.id,
            'hora_inicio': '13:30',
            'hora_fin': '15:00',
            'tipo_horario': 'CLASE',
            'dia_semana': 'LUNES',
        }
        resp = self.client.post('/api/horarios/', data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_planificacion_and_historial(self):
        d = Distributivo.objects.create(anio_lectivo_referencia='2026', docente_referencia='D')
        da = DistributivoAsignatura.objects.create(distributivo=d, asignatura_ofertada_referencia='Lengua')
        # Create planificacion via API
        resp = self.client.post('/api/planificaciones/', {'distributivo_asignatura': da.id, 'observacion': ''}, format='multipart')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        pid = resp.data['id']

        # Create historial
        hist_data = {'planificacion_curricular': pid, 'estado_anterior': 'BORRADOR', 'estado_actual': 'POR_APROBAR', 'observacion': 'Cambio'}
        resp2 = self.client.post('/api/planificaciones-historial/', hist_data, format='json')
        self.assertEqual(resp2.status_code, status.HTTP_201_CREATED)
