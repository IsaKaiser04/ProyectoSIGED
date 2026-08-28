"""
Reglas de cálculo automático de las fechas de los periodos de matrícula.

Reglas (régimen académico ecuatoriano):
- ORDINARIA: la matrícula cierra 20 días antes del inicio de clases.
- EXTRAORDINARIA: dentro de los primeros 100 días de clases.
- ESPECIAL: posterior a los 100 días de la extraordinaria, hasta el fin del año lectivo.

La referencia es la fecha de inicio del primer período académico del año lectivo.
"""
from datetime import datetime, time, timedelta, timezone

from apps.matricula.models.enums import MatriculaPeriodoTipo

DIAS_CIERRE_ORDINARIA = 20
DIAS_VENTANA_ORDINARIA = 30
DIAS_EXTRAORDINARIA = 100


def inicio_clases(anio_lectivo):
    """Fecha de inicio de clases: primer período académico del año lectivo."""
    primer_periodo = anio_lectivo.periodos_academicos.order_by('fechaInicio').first()
    if primer_periodo:
        return primer_periodo.fechaInicio
    return anio_lectivo.fechaInicio


def _fecha_guardada(fecha):
    """Convierte un date en datetime con zona horaria UTC para el modelo."""
    return datetime.combine(fecha, time.min, tzinfo=timezone.utc)


def calcular_fechas(tipo, anio_lectivo):
    """
    Calcula fecha_inicio y fecha_fin para un tipo de periodo de matrícula
    según la fecha de inicio de clases del año lectivo.

    Retorna un dict con las fechas o None si el tipo o el año lectivo no son válidos.
    """
    if anio_lectivo is None:
        return None

    clases = inicio_clases(anio_lectivo)

    if tipo == MatriculaPeriodoTipo.ORDINARIA:
        cierre = clases - timedelta(days=DIAS_CIERRE_ORDINARIA)
        return {
            'fecha_inicio': _fecha_guardada(cierre - timedelta(days=DIAS_VENTANA_ORDINARIA)),
            'fecha_fin': _fecha_guardada(cierre),
        }

    if tipo == MatriculaPeriodoTipo.EXTRAORDINARIA:
        return {
            'fecha_inicio': _fecha_guardada(clases),
            'fecha_fin': _fecha_guardada(clases + timedelta(days=DIAS_EXTRAORDINARIA)),
        }

    if tipo == MatriculaPeriodoTipo.ESPECIAL:
        return {
            'fecha_inicio': _fecha_guardada(clases + timedelta(days=DIAS_EXTRAORDINARIA + 1)),
            'fecha_fin': _fecha_guardada(anio_lectivo.fechaFin),
        }

    return None