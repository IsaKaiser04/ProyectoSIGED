from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria


class CalificacionService:

    @transaction.atomic
    def registrar_calificacion(self, asignatura_evaluacion, matricula, valor, observacion='', promedio_categoria=None):
        calificacion, created = Calificacion.objects.update_or_create(
            asignatura_evaluacion=asignatura_evaluacion,
            matricula=matricula,
            defaults={
                'valor': valor,
                'observacion': observacion,
                'promedio_categoria': promedio_categoria,
            },
        )
        if not created:
            self._guardar_historico(calificacion, valor, observacion)
        return calificacion, created

    @transaction.atomic
    def actualizar_calificacion(self, calificacion_id, valor, observacion=''):
        try:
            calificacion = Calificacion.objects.select_for_update().get(id=calificacion_id)
        except Calificacion.DoesNotExist:
            return None
        self._guardar_historico(calificacion, valor, observacion)
        calificacion.valor = valor
        calificacion.observacion = observacion
        calificacion.save()
        return calificacion

    def _guardar_historico(self, calificacion, valor_nuevo, observacion=''):
        if calificacion.valor != valor_nuevo:
            CalificacionHistorico.objects.create(
                valor_anterior=calificacion.valor,
                valor_nuevo=valor_nuevo,
                observacion=observacion or calificacion.observacion,
                calificacion=calificacion,
            )

    def calcular_promedio(self, calificaciones):
        if not calificaciones:
            return Decimal('0.00')
        total = sum(c.valor for c in calificaciones)
        return (total / len(calificaciones)).quantize(Decimal('0.01'))

    def calcular_equivalencia(self, valor, rubrica=None):
        if not rubrica:
            return ''
        equivalencia = rubrica.equivalencias.filter(
            evaluacioncriterio__cuantitativaMinima__lte=valor,
            evaluacioncriterio__cuantitativaMaxima__gte=valor,
        ).first()
        if equivalencia:
            criterio = equivalencia.criterios.filter(
                cuantitativaMinima__lte=valor,
                cuantitativaMaxima__gte=valor,
            ).first()
            return criterio.cualitativa if criterio else equivalencia.nombre
        return ''

    def calcular_estado_final(self, promedio, nota_minima_aprobacion=Decimal('7.00')):
        return 'APROBADO' if promedio >= nota_minima_aprobacion else 'REPROBADO'
