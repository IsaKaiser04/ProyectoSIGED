from django.test import TestCase, Client
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Distributivo
from .serializers import DistributivoSerializer
import json

class DistributivoModelTest(TestCase):
    """Pruebas del modelo Distributivo"""
    
    def setUp(self):
        """Crear datos de prueba"""
        self.distributivo = Distributivo.objects.create(
            docente="Juan Pérez",
            materia="Matemáticas",
            paralelo="A",
            horas=6,
            horario="Lunes 08:00-10:00"
        )
    
    def test_crear_distributivo(self):
        """Verificar que se crea correctamente un distributivo"""
        self.assertTrue(isinstance(self.distributivo, Distributivo))
        self.assertEqual(self.distributivo.docente, "Juan Pérez")
        self.assertEqual(self.distributivo.materia, "Matemáticas")

    def test_str_distributivo(self):
        """Verificar representación en string"""
        self.assertEqual(
            str(self.distributivo),
            "Juan Pérez - Matemáticas (Lunes 08:00-10:00)"
        )

    def test_horas_rango_valido(self):
        """Verificar que horas está en rango válido"""
        self.assertGreaterEqual(self.distributivo.horas, 1)
        self.assertLessEqual(self.distributivo.horas, 40)

    def test_constraint_unique_docente_horario(self):
        """Verificar que no se permita duplicado docente+horario"""
        with self.assertRaises(Exception):
            Distributivo.objects.create(
                docente="Juan Pérez",
                materia="Física",
                paralelo="B",
                horas=4,
                horario="Lunes 08:00-10:00"
            )


class DistributivoSerializerTest(TestCase):
    """Pruebas del serializador"""
    
    def setUp(self):
        self.distributivo = Distributivo.objects.create(
            docente="María García",
            materia="Química",
            paralelo="C",
            horas=5,
            horario="Martes 10:00-12:00"
        )

    def test_serializer_valido(self):
        """Verificar serialización válida"""
        serializer = DistributivoSerializer(self.distributivo)
        data = serializer.data
        
        self.assertEqual(data['docente'], "María García")
        self.assertEqual(data['materia'], "Química")
        self.assertEqual(data['horas'], 5)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

    def test_validacion_horas_negativas(self):
        """Verificar que no acepte horas negativas"""
        data = {
            'docente': 'Juan',
            'materia': 'Historia',
            'paralelo': 'A',
            'horas': -5,
            'horario': 'Miércoles 14:00-16:00'
        }
        serializer = DistributivoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('horas', serializer.errors)

    def test_validacion_horas_cero(self):
        """Verificar que no acepte cero horas"""
        data = {
            'docente': 'Juan',
            'materia': 'Historia',
            'paralelo': 'A',
            'horas': 0,
            'horario': 'Miércoles 14:00-16:00'
        }
        serializer = DistributivoSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_validacion_horas_excede_maximo(self):
        """Verificar que no acepte más de 40 horas"""
        data = {
            'docente': 'Juan',
            'materia': 'Historia',
            'paralelo': 'A',
            'horas': 50,
            'horario': 'Miércoles 14:00-16:00'
        }
        serializer = DistributivoSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_validacion_duplicado_docente_horario(self):
        """Verificar que rechaza duplicado docente+horario"""
        data = {
            'docente': 'María García',
            'materia': 'Biología',
            'paralelo': 'D',
            'horas': 4,
            'horario': 'Martes 10:00-12:00'  # Ya existe
        }
        serializer = DistributivoSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        # El error se captura en non_field_errors por el constraint unique_together
        self.assertIn('non_field_errors', serializer.errors)

    def test_update_permite_mismo_horario(self):
        """Verificar que UPDATE permite cambiar solo docente/materia sin error duplicado"""
        data = {
            'docente': 'María García',
            'materia': 'Física',  # Cambiado
            'paralelo': 'C',
            'horas': 5,
            'horario': 'Martes 10:00-12:00'  # Mismo horario
        }
        serializer = DistributivoSerializer(self.distributivo, data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)


class DistributivoAPITest(APITestCase):
    """Pruebas de los endpoints REST"""
    
    def setUp(self):
        self.client = APIClient()
        self.base_url = '/api/distributivos/'
        
        self.distributivo1 = Distributivo.objects.create(
            docente="Carlos López",
            materia="Inglés",
            paralelo="A",
            horas=4,
            horario="Lunes 14:00-16:00"
        )
        
        self.distributivo2 = Distributivo.objects.create(
            docente="Rosa Martínez",
            materia="Español",
            paralelo="B",
            horas=5,
            horario="Martes 16:00-18:00"
        )

    # Tests GET
    def test_listar_distributivos(self):
        """Verificar listado de distributivos"""
        response = self.client.get(self.base_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 2)

    def test_obtener_distributivo_por_id(self):
        """Verificar obtención de distributivo por ID"""
        url = f"{self.base_url}{self.distributivo1.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['docente'], "Carlos López")

    def test_obtener_distributivo_inexistente(self):
        """Verificar error al obtener distributivo inexistente"""
        url = f"{self.base_url}999/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_filtrar_por_docente(self):
        """Verificar filtrado por docente"""
        response = self.client.get(f"{self.base_url}?docente=Carlos López")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)
        self.assertEqual(response.data['data'][0]['docente'], "Carlos López")

    def test_buscar_por_materia(self):
        """Verificar búsqueda por materia"""
        response = self.client.get(f"{self.base_url}?search=Inglés")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    # Tests POST
    def test_crear_distributivo_valido(self):
        """Verificar creación de distributivo válido"""
        data = {
            'docente': 'nuevo Docente',
            'materia': 'Arte',
            'paralelo': 'C',
            'horas': 3,
            'horario': 'Miércoles 08:00-09:00'
        }
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['message'], 'Distributivo creado correctamente')
        self.assertEqual(Distributivo.objects.count(), 3)

    def test_crear_distributivo_sin_docente(self):
        """Verificar rechazo si falta docente"""
        data = {
            'materia': 'Arte',
            'paralelo': 'C',
            'horas': 3,
            'horario': 'Miércoles 08:00-09:00'
        }
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crear_distributivo_horas_invalidas(self):
        """Verificar rechazo si horas son inválidas"""
        data = {
            'docente': 'Nuevo',
            'materia': 'Arte',
            'paralelo': 'C',
            'horas': 0,
            'horario': 'Miércoles 08:00-09:00'
        }
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crear_duplicado_docente_horario(self):
        """Verificar rechazo de duplicado docente+horario"""
        data = {
            'docente': 'Carlos López',
            'materia': 'Matemáticas',
            'paralelo': 'B',
            'horas': 6,
            'horario': 'Lunes 14:00-16:00'  # Ya existe
        }
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Tests PUT
    def test_actualizar_distributivo_completo(self):
        """Verificar actualización completa (PUT)"""
        data = {
            'docente': 'Carlos López',
            'materia': 'Francés',
            'paralelo': 'A',
            'horas': 5,
            'horario': 'Lunes 14:00-16:00'
        }
        url = f"{self.base_url}{self.distributivo1.id}/"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['materia'], 'Francés')

    def test_actualizar_distributivo_parcial(self):
        """Verificar actualización parcial (PATCH)"""
        data = {'materia': 'Ética'}
        url = f"{self.base_url}{self.distributivo1.id}/"
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    def test_actualizar_mismo_horario_no_falla(self):
        """Verificar que UPDATE con mismo horario funciona"""
        data = {
            'docente': 'Carlos López',
            'materia': 'Educación Física',
            'paralelo': 'A',
            'horas': 2,
            'horario': 'Lunes 14:00-16:00'  # Mismo horario
        }
        url = f"{self.base_url}{self.distributivo1.id}/"
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    # Tests DELETE
    def test_eliminar_distributivo(self):
        """Verificar eliminación de distributivo"""
        url = f"{self.base_url}{self.distributivo1.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(response.data['success'])
        self.assertEqual(Distributivo.objects.count(), 1)

    def test_eliminar_distributivo_inexistente(self):
        """Verificar error al eliminar inexistente"""
        url = f"{self.base_url}999/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Tests de endpoints personalizados
    def test_endpoint_por_docente(self):
        """Verificar endpoint personalizado /por-docente/"""
        response = self.client.get(f"{self.base_url}por-docente/Carlos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(len(response.data['data']), 1)

    def test_endpoint_estadisticas(self):
        """Verificar endpoint de estadísticas"""
        response = self.client.get(f"{self.base_url}estadisticas/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('total_distributivos', response.data['data'])
        self.assertEqual(response.data['data']['total_distributivos'], 2)

