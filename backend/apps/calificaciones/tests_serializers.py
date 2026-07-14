from django.test import TestCase
from rest_framework.exceptions import ValidationError
from decimal import Decimal

from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.models.evaluacionCriterio import EvaluacionCriterio
from apps.calificaciones.serializers.evaluacion_categoria_serializer import EvaluacionCategoriaSerializer
from apps.calificaciones.serializers.evaluacion_criterio_serializer import EvaluacionCriterioSerializer


class EvaluacionCategoriaSerializerTest(TestCase):
    def setUp(self):
        self.categoria = EvaluacionCategoria.objects.create(
            nombre='Tareas',
            nota_minima=0,
            nota_maxima=10,
            periodoAcademico_id=1,
            tipo_calculo='SIMPLE',
        )

    def test_serializa_campos_esperados(self):
        serializer = EvaluacionCategoriaSerializer(self.categoria)
        self.assertIn('id', serializer.data)
        self.assertIn('nombre', serializer.data)
        self.assertIn('subcategorias', serializer.data)
        self.assertIn('tipo_calculo', serializer.data)
        self.assertEqual(serializer.data['nombre'], 'Tareas')

    def test_subcategorias_vacia_por_defecto(self):
        serializer = EvaluacionCategoriaSerializer(self.categoria)
        self.assertEqual(serializer.data['subcategorias'], [])

    def test_subcategorias_anidadas(self):
        hija = EvaluacionCategoria.objects.create(
            nombre='Tarea Individual',
            nota_minima=0,
            nota_maxima=10,
            periodoAcademico_id=1,
            padre=self.categoria,
        )
        serializer = EvaluacionCategoriaSerializer(self.categoria)
        self.assertEqual(len(serializer.data['subcategorias']), 1)
        self.assertEqual(serializer.data['subcategorias'][0]['nombre'], 'Tarea Individual')

    def test_validacion_tipo_calculo_invalido(self):
        serializer = EvaluacionCategoriaSerializer(data={
            'nombre': 'Test',
            'nota_minima': 0,
            'nota_maxima': 10,
            'periodoAcademico_id': 1,
            'tipo_calculo': 'INVALIDO',
        })
        self.assertFalse(serializer.is_valid())

    def test_validacion_tipo_calculo_valido(self):
        serializer = EvaluacionCategoriaSerializer(data={
            'nombre': 'Test',
            'nota_minima': 0,
            'nota_maxima': 10,
            'periodoAcademico_id': 1,
            'tipo_calculo': 'PONDERADO',
        })
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)


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
