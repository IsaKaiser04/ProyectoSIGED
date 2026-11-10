from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria

CENTESIMA = Decimal('0.01')
NOTA_MINIMA_APROBACION = Decimal('7.00')
TOLERANCIA_PESOS = Decimal('0.0001')

# (límite inferior inclusivo, etiqueta). Regla 6: la cualitativa la calcula el backend.
# TODO: confirmar etiquetas con la institución (esta es una escala provisional).
ESCALA_CUALITATIVA = (
    (Decimal('9.00'), 'Excelente'),
    (Decimal('7.00'), 'Muy bueno'),
    (Decimal('4.01'), 'Regular'),
    (Decimal('0.00'), 'Insuficiente'),
)


def _redondear(valor):
    return valor.quantize(CENTESIMA, rounding=ROUND_HALF_UP)


class PromedioService:

    # ------------------------------------------------------------------ #
    # Cálculo puro (sin BD): fácil de testear
    # ------------------------------------------------------------------ #
    @staticmethod
    def cualitativa(valor):
        """Regla 6: 9-10 Excelente, etc. Devuelve '' si no hay nota."""
        if valor is None:
            return ''
        for limite, etiqueta in ESCALA_CUALITATIVA:
            if valor >= limite:
                return etiqueta
        return ESCALA_CUALITATIVA[-1][1]

    @staticmethod
    def calcular_promedio_periodo(secciones, actividades, notas):
        """
        Promedio de UN período para UN estudiante según la rúbrica del año.

        :param secciones: EvaluacionCategoria de la rúbrica (con `peso`).
        :param actividades: AsignaturaEvaluacion del período (de una sola asignatura).
        :param notas: dict {actividad_id: Decimal}. Una actividad sin nota cuenta como 0.
        :return: (promedio | None, {seccion_id: promedio_seccion}).

        - Nota de la sección = promedio simple de sus actividades.
        - Nota del período = Σ nota_sección × peso. Si una sección no tiene actividades
          en el período, su peso se reparte entre las que sí tienen (se divide entre la
          suma de pesos usados), para que el período siga siendo sobre 10.
        - Actividades sin sección (creadas fuera de la rúbrica) no cuentan.
        """
        cero = Decimal('0')
        por_seccion = defaultdict(list)
        for a in actividades:
            if a.evaluacion_categoria_id is not None:
                por_seccion[a.evaluacion_categoria_id].append(a)

        promedios_seccion = {}
        suma, pesos = cero, cero
        for s in secciones:
            acts = por_seccion.get(s.id)
            if not acts:
                continue
            prom = _redondear(sum((notas.get(a.id, cero) for a in acts), cero) / len(acts))
            promedios_seccion[s.id] = prom
            suma += prom * s.peso
            pesos += s.peso

        if pesos <= cero:
            return None, promedios_seccion
        return _redondear(suma / pesos), promedios_seccion

    @staticmethod
    def calcular_nota_final(promedios_periodo, total_periodos):
        """
        Nota final del año = promedio de los promedios de cada período.

        :return: (valor | None, todos_los_periodos_calculados: bool).
        """
        calculados = [p for p in promedios_periodo if p is not None]
        if not calculados:
            return None, False
        valor = _redondear(sum(calculados, Decimal('0')) / len(calculados))
        return valor, len(calculados) == total_periodos

    @staticmethod
    def supletorio_habilitado(nota_final, completo, nota_minima=NOTA_MINIMA_APROBACION):
        """Regla 4: solo con el año completo y la nota final bajo el mínimo."""
        return bool(completo and nota_final is not None and nota_final < nota_minima)

    @staticmethod
    def estado_final(nota_final, completo, supletorio=None, nota_minima=NOTA_MINIMA_APROBACION):
        """
        Estado de la asignatura en el año.

        EN_CURSO    -> faltan promedios de período o notas por registrar.
        APROBADO    -> nota final >= mínima, o supletorio >= mínima.
        SUPLETORIO  -> nota final < mínima y aún no se registra el supletorio.
        REPROBADO   -> supletorio registrado y < mínima.
        """
        if not completo or nota_final is None:
            return 'EN_CURSO'
        if nota_final >= nota_minima:
            return 'APROBADO'
        if supletorio is None:
            return 'SUPLETORIO'
        return 'APROBADO' if supletorio >= nota_minima else 'REPROBADO'

    # ------------------------------------------------------------------ #
    # Persistencia: Promedio (matrícula + asignatura + período) y un
    # PromedioCategoria por cada sección con actividades.
    # ------------------------------------------------------------------ #
    @staticmethod
    def secciones_del_anio(anio_lectivo_id):
        return list(EvaluacionCategoria.objects.filter(libro__anio_lectivo_id=anio_lectivo_id))

    @classmethod
    @transaction.atomic
    def persistir_promedio_periodo(cls, matricula, distributivo_asignatura, periodo, secciones=None):
        if secciones is None:
            secciones = cls.secciones_del_anio(distributivo_asignatura.distributivo.anio_lectivo_id)
        actividades = list(
            AsignaturaEvaluacion.objects.filter(
                distributivo_asignatura=distributivo_asignatura,
                periodo_academico=periodo,
                activo=True,
            )
        )
        notas = dict(
            Calificacion.objects.filter(
                matricula=matricula,
                asignatura_evaluacion__in=actividades,
            ).values_list('asignatura_evaluacion_id', 'valor')
        )
        filtro = dict(
            matricula=matricula,
            distributivo_asignatura=distributivo_asignatura,
            periodo_academico=periodo,
        )
        valor, por_seccion = cls.calcular_promedio_periodo(secciones, actividades, notas)

        if valor is None:
            # Dato derivado: si ya no se puede calcular, no dejar uno viejo.
            Promedio.objects.filter(**filtro).delete()
            return None

        promedio, _ = Promedio.objects.update_or_create(
            **filtro,
            defaults={'valor': valor, 'fecha_calculo': timezone.now()},
        )
        promedio.promedios_categoria.exclude(evaluacion_categoria_id__in=por_seccion).delete()
        for seccion_id, prom in por_seccion.items():
            PromedioCategoria.objects.update_or_create(
                promedio=promedio,
                evaluacion_categoria_id=seccion_id,
                defaults={'valor': prom},
            )
        return promedio
