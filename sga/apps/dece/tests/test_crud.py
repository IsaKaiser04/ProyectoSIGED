from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from apps.dece.models import (
    AdaptacionCurricular,
    AdaptacionCurricularEvidencia,
    AdaptacionCurricularPlanificacion,
    AdaptacionEstado,
    DiscapacidadGrado,
    DiscapacidadTipo,
)
from apps.dece.serializers import (
    AdaptacionCurricularEvidenciaSerializer,
    AdaptacionCurricularPlanificacionSerializer,
    AdaptacionCurricularSerializer,
)


class AdaptacionCurricularModelTest(TestCase):
    def test_create_model(self):
        adaptacion = AdaptacionCurricular.objects.create(
            matricula_referencia='MAT-001',
            discapacidad_tipo=DiscapacidadTipo.VISUAL,
            discapacidad_grado=DiscapacidadGrado.RANGO_5_24,
            necesidad_educativa='Material en braille',
        )

        self.assertEqual(str(adaptacion), 'Material en braille')


class AdaptacionCurricularSerializerTest(TestCase):
    def test_serializer_valid(self):
        serializer = AdaptacionCurricularSerializer(data={
            'matricula_referencia': 'MAT-002',
            'discapacidad_tipo': DiscapacidadTipo.AUDITIVA,
            'discapacidad_grado': DiscapacidadGrado.RANGO_25_49,
            'necesidad_educativa': 'Apoyo de lenguaje de senas',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)


class AdaptacionCurricularAPITest(APITestCase):
    def setUp(self):
        self.adaptacion = AdaptacionCurricular.objects.create(
            matricula_referencia='MAT-010',
            discapacidad_tipo=DiscapacidadTipo.FISICA,
            discapacidad_grado=DiscapacidadGrado.RANGO_50_74,
            necesidad_educativa='Acceso preferente al aula',
        )
        self.evidencia_file = SimpleUploadedFile('evidencia.txt', b'contenido')
        self.planificacion_file = SimpleUploadedFile('planificacion.txt', b'contenido')

    def test_crud_adaptacion_curricular(self):
        create_response = self.client.post('/api/adaptaciones-curriculares/', {
            'matricula_referencia': 'MAT-011',
            'discapacidad_tipo': DiscapacidadTipo.INTELECTUAL,
            'discapacidad_grado': DiscapacidadGrado.RANGO_75_95,
            'necesidad_educativa': 'Apoyo pedagogico personalizado',
        }, format='json')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        list_response = self.client.get('/api/adaptaciones-curriculares/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        detail_response = self.client.patch(f'/api/adaptaciones-curriculares/{self.adaptacion.id}/', {
            'necesidad_educativa': 'Ajuste curricular individualizado',
        }, format='json')
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_crud_evidencia(self):
        create_response = self.client.post('/api/adaptaciones-evidencias/', {
            'adaptacion_curricular': self.adaptacion.id,
            'archivo': self.evidencia_file,
            'descripcion': 'Documento de respaldo',
        }, format='multipart')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        evidencia = AdaptacionCurricularEvidencia.objects.first()
        update_response = self.client.put(f'/api/adaptaciones-evidencias/{evidencia.id}/', {
            'adaptacion_curricular': self.adaptacion.id,
            'descripcion': 'Documento de respaldo actualizado',
        }, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_crud_planificacion(self):
        create_response = self.client.post('/api/adaptaciones-planificaciones/', {
            'adaptacion_curricular': self.adaptacion.id,
            'archivo': self.planificacion_file,
            'comentario': 'Planificacion inicial',
            'estado': AdaptacionEstado.BORRADOR,
        }, format='multipart')
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        planificacion = AdaptacionCurricularPlanificacion.objects.first()
        patch_response = self.client.patch(f'/api/adaptaciones-planificaciones/{planificacion.id}/', {
            'comentario': 'Planificacion revisada',
            'estado': AdaptacionEstado.ENVIADO,
        }, format='json')
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

        delete_response = self.client.delete(f'/api/adaptaciones-planificaciones/{planificacion.id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)