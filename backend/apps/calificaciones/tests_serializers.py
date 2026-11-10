from django.test import TestCase

from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.models.evaluacionCriterio import EvaluacionCriterio
from apps.calificaciones.serializers.evaluacion_criterio_serializer import EvaluacionCriterioSerializer


class EvaluacionCriterioSerializerTest(TestCase):
    def setUp(self):
        self.rubrica = EvaluacionRubrica.objects.create(
            nombre='Rubrica prueba',
            evaluacion_tipo='CUANTITATIVA',
        )
        self.equivalencia = EvaluacionEquivalencia.objects.create(
            nombre='Excelente',
            evaluacion_rubrica=self.rubrica,
        )
        self.criterio = EvaluacionCriterio.objects.create(
            cuantitativaMinima=9,
            cuantitativaMaxima=10,
            cualitativa='Excelente',
            descripcion='Rendimiento sobresaliente',
            evaluacion_rubrica=self.rubrica,
            evaluacion_equivalencia=self.equivalencia,
        )

    def test_campos_incluyen_labels(self):
        serializer = EvaluacionCriterioSerializer(self.criterio)
        self.assertIn('evaluacion_rubrica_label', serializer.data)
        self.assertIn('evaluacion_equivalencia_label', serializer.data)

    def test_rubrica_label_retorna_nombre(self):
        serializer = EvaluacionCriterioSerializer(self.criterio)
        self.assertEqual(serializer.data['evaluacion_rubrica_label'], 'Rubrica prueba')

    def test_equivalencia_label_retorna_nombre(self):
        serializer = EvaluacionCriterioSerializer(self.criterio)
        self.assertEqual(serializer.data['evaluacion_equivalencia_label'], 'Excelente')
