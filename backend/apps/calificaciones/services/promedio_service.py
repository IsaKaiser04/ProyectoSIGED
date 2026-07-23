from decimal import Decimal
from django.db import transaction
from django.utils import timezone

from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria
from apps.calificaciones.models.calificacion import Calificacion


class PromedioService:

    @transaction.atomic
    def recalcular_promedios(self, matricula, distributivo_asignatura, periodo_academico=None):
        calificaciones = Calificacion.objects.filter(
            asignatura_evaluacion__distributivo_asignatura=distributivo_asignatura,
            matricula=matricula,
        )
        if periodo_academico:
            calificaciones = calificaciones.filter(
                asignatura_evaluacion__periodo_academico=periodo_academico,
            )
        if not calificaciones.exists():
            return None

        total = sum(c.valor for c in calificaciones)
        valor_promedio = (total / calificaciones.count()).quantize(Decimal('0.01'))

        promedio, _ = Promedio.objects.update_or_create(
            matricula=matricula,
            distributivo_asignatura=distributivo_asignatura,
            periodo_academico=periodo_academico,
            defaults={
                'valor': valor_promedio,
                'fecha_calculo': timezone.now(),
            },
        )
        return promedio

    @transaction.atomic
    def recalcular_promedios_categoria(self, promedio):
        categorias = set(
            Calificacion.objects.filter(
                promedio_categoria__promedio=promedio,
            ).values_list('promedio_categoria__evaluacion_categoria', flat=True)
        )
        for categoria_id in categorias:
            calificaciones = Calificacion.objects.filter(
                promedio_categoria__promedio=promedio,
                promedio_categoria__evaluacion_categoria_id=categoria_id,
            )
            if calificaciones.exists():
                total = sum(c.valor for c in calificaciones)
                valor = (total / calificaciones.count()).quantize(Decimal('0.01'))
            else:
                valor = Decimal('0.00')

            PromedioCategoria.objects.filter(
                promedio=promedio,
                evaluacion_categoria_id=categoria_id,
            ).update(valor=valor)
