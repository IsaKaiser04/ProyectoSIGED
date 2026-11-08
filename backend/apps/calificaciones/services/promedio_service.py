from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria
from apps.calificaciones.models.tipoCalculo import TipoCalculo

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


class ConfiguracionPeriodoInvalida(Exception):
    """Actividades del período mal configuradas (tipos mezclados o pesos != 1)."""

    def __init__(self, detalle):
        super().__init__(detalle)
        self.detalle = detalle


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
    def validar_pesos(actividades):
        """Regla 3: en un período ponderado la suma de pesos debe ser 1.0 (100 %)."""
        actividades = list(actividades)
        if any(a.peso is None for a in actividades):
            raise ConfiguracionPeriodoInvalida(
                'Hay actividades ponderadas sin peso definido.'
            )
        suma = sum((a.peso for a in actividades), Decimal('0'))
        if abs(suma - Decimal('1')) > TOLERANCIA_PESOS:
            raise ConfiguracionPeriodoInvalida(
                f'Los pesos del período suman {suma * 100:.2f} % y deben sumar 100 %.'
            )

    @classmethod
    def calcular_promedio_periodo(cls, actividades, notas):
        """
        Regla 3 – promedio de UN período para UN estudiante.

        :param actividades: AsignaturaEvaluacion del período (de una sola asignatura).
        :param notas: dict {actividad_id: Decimal}. Una actividad sin nota cuenta como 0,
                      porque la regla divide entre el TOTAL de actividades.
        :return: Decimal (2 decimales) o None si el período no tiene actividades.
        """
        actividades = list(actividades)
        if not actividades:
            return None

        tipos = {a.tipo_calculo for a in actividades}
        if len(tipos) > 1:
            raise ConfiguracionPeriodoInvalida(
                'No se pueden mezclar actividades Simples y Ponderadas en el mismo período.'
            )

        cero = Decimal('0')
        if tipos == {TipoCalculo.PONDERADO}:
            cls.validar_pesos(actividades)
            total = sum((notas.get(a.id, cero) * a.peso for a in actividades), cero)
        else:  # SIMPLE
            total = sum((notas.get(a.id, cero) for a in actividades), cero) / len(actividades)

        return _redondear(total)

    @classmethod
    def calcular_nota_final(cls, promedios_periodo, total_periodos):
        """
        Nota final del año a partir de los promedios de cada período.

        ⚠ La regla de negocio dice "suma de los promedios de cada período". Con 3 períodos
        sobre 10 esa suma llega a 30 y nunca sería < 7.0, así que el supletorio jamás se
        habilitaría. Aquí se usa el PROMEDIO de los promedios de período. Si de verdad se
        necesita la suma, es cambiar la línea marcada abajo.

        :return: (valor | None, completo: bool). `completo` = todos los períodos del año
                 tienen promedio; hasta entonces la nota es parcial.
        """
        calculados = [p for p in promedios_periodo if p is not None]
        if not calculados:
            return None, False
        valor = _redondear(sum(calculados, Decimal('0')) / len(calculados))  # <- promedio
        return valor, len(calculados) == total_periodos

    @staticmethod
    def supletorio_habilitado(nota_final, completo, nota_minima=NOTA_MINIMA_APROBACION):
        """Regla 4: solo con el año completo y la nota final bajo el mínimo."""
        return bool(completo and nota_final is not None and nota_final < nota_minima)

    @staticmethod
    def estado_final(nota_final, completo, supletorio=None, nota_minima=NOTA_MINIMA_APROBACION):
        """
        Estado de la asignatura en el año.

        EN_CURSO    -> faltan promedios de período (nota parcial).
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
    # Persistencia (modelo Promedio, uno por matrícula + asignatura + período)
    # ------------------------------------------------------------------ #
    @classmethod
    @transaction.atomic
    def persistir_promedio_periodo(cls, matricula, distributivo_asignatura, periodo):
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
        try:
            valor = cls.calcular_promedio_periodo(actividades, notas)
        except ConfiguracionPeriodoInvalida:
            valor = None

        if valor is None:
            # Promedio es un dato derivado: si ya no se puede calcular, no dejar uno viejo.
            Promedio.objects.filter(**filtro).delete()
            return None

        promedio, _ = Promedio.objects.update_or_create(
            **filtro,
            defaults={'valor': valor, 'fecha_calculo': timezone.now()},
        )
        return promedio

    # Se conserva del servicio anterior (lo usa el módulo EVA / PromedioCategoria).
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
                valor = _redondear(total / calificaciones.count())
            else:
                valor = Decimal('0.00')
            PromedioCategoria.objects.filter(
                promedio=promedio,
                evaluacion_categoria_id=categoria_id,
            ).update(valor=valor)