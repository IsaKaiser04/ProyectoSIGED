"""
Reglas del régimen académico ecuatoriano (200 días laborables / 40 semanas lectivas).

Fuente: Ministerio de Educación del Ecuador.
- TRIMESTRE: 3 períodos de 13, 13 y 14 semanas (65 + 65 + 70 días laborables).
- QUIMESTRE: 2 períodos de 20 semanas (100 + 100 días laborables).
- BIMESTRE: 4 períodos de 10 semanas (50 días laborables c/u).

Cada semana lectiva equivale a 5 días laborables (lunes a viernes).
"""
from datetime import timedelta

DIAS_POR_SEMANA = 5
DIAS_LABORABLES_ANIO = 200
SEMANAS_LECTIVAS_ANIO = 40

# Tolerancia máxima de días laborables faltantes por período
# (feriados nacionales u otros días no laborables dentro del rango).
TOLERANCIA_DIAS = 5

ORDINALES = ['Primer', 'Segundo', 'Tercer', 'Cuarto']

# Semanas lectivas esperadas por cada período, según el orden.
DISTRIBUCION_REGLEMENTARIA = {
    'TRIMESTRE': [13, 13, 14],   # 65 + 65 + 70 = 200 días
    'QUIMESTRE': [20, 20],       # 100 + 100   = 200 días
    'BIMESTRE': [10, 10, 10, 10] # 50 x 4      = 200 días
}


def semanas_esperadas(periodo_tipo):
    """Lista de semanas lectivas esperadas por período para un tipo dado."""
    return DISTRIBUCION_REGLEMENTARIA.get(periodo_tipo)


def dias_esperados(periodo_tipo):
    """Lista de días laborables esperados por período para un tipo dado."""
    semanas = semanas_esperadas(periodo_tipo)
    if not semanas:
        return None
    return [s * DIAS_POR_SEMANA for s in semanas]


def contar_dias_laborables(fecha_inicio, fecha_fin):
    """Cuenta los días laborables (lunes a viernes) entre dos fechas, inclusive."""
    if fecha_inicio > fecha_fin:
        return 0
    dias = 0
    cursor = fecha_inicio
    while cursor <= fecha_fin:
        if cursor.weekday() < 5:  # 0=Lunes ... 4=Viernes
            dias += 1
        cursor += timedelta(days=1)
    return dias


def generar_periodos_data(fecha_inicio_anio, periodo_tipo):
    """
    Genera la estructura de períodos académicos para un tipo de régimen,
    a partir de la fecha de inicio del año lectivo.

    Cada período inicia en lunes y termina en viernes; los períodos son
    continuos entre sí (el receso se puede reflejar ajustando fechas luego).
    Retorna una lista de dicts compatible con PeriodoAcademicoSerializer.
    """
    semanas_lista = semanas_esperadas(periodo_tipo)
    if not semanas_lista:
        return []

    # El año lectivo inicia el primer lunes igual o posterior a la fecha dada.
    cursor = fecha_inicio_anio
    while cursor.weekday() != 0:  # 0 = Lunes
        cursor += timedelta(days=1)

    periodos = []
    for indice, semanas in enumerate(semanas_lista):
        fecha_inicio = cursor
        fecha_fin = fecha_inicio + timedelta(days=(semanas * 7) - 3)  # Viernes de la última semana
        periodos.append({
            'orden': str(indice + 1),
            'nombre': f"{ORDINALES[indice]} {periodo_tipo.capitalize()}",
            'fechaInicio': fecha_inicio,
            'fechaFin': fecha_fin,
            'periodoTipo': periodo_tipo,
        })
        cursor = fecha_fin + timedelta(days=3)  # Lunes siguiente
    return periodos


def validar_distribucion(periodos_data, anio=None):
    """
    Valida que la lista de períodos cumpla la distribución reglamentaria.

    Reglas:
    - Todos los períodos deben ser del mismo tipo.
    - La cantidad debe coincidir con el régimen elegido (2, 3 o 4).
    - Cada período debe tener entre (esperado - TOLERANCIA_DIAS) y esperado
      días laborables (lunes a viernes) en su rango de fechas.
    - Los períodos no deben solaparse ni desordenarse cronológicamente.
    - Deben estar dentro del rango de fechas del año lectivo (si se provee).

    Retorna una lista de errores (vacía si todo cumple).
    """
    errores = []
    if not periodos_data:
        return errores

    tipos = {p.get('periodoTipo') for p in periodos_data}
    if len(tipos) > 1:
        errores.append(
            'Todos los períodos del año lectivo deben ser del mismo tipo '
            '(solo quimestres, solo trimestres o solo bimestres).'
        )
        return errores

    periodo_tipo = tipos.pop()
    esperado_dias = dias_esperados(periodo_tipo)
    cantidad_esperada = len(esperado_dias)

    if len(periodos_data) != cantidad_esperada:
        errores.append(
            f'El régimen de {periodo_tipo.lower()}s requiere exactamente '
            f'{cantidad_esperada} períodos (se registraron {len(periodos_data)}).'
        )
        return errores

    ordenados = sorted(periodos_data, key=lambda p: p['fechaInicio'])

    fecha_anterior_fin = None
    for indice, periodo in enumerate(ordenados):
        etiqueta = periodo.get('nombre') or f"Período {periodo.get('orden')}"
        fecha_inicio = periodo['fechaInicio']
        fecha_fin = periodo['fechaFin']
        dias_reales = contar_dias_laborables(fecha_inicio, fecha_fin)
        dias_objetivo = esperado_dias[indice]

        if anio is not None:
            if fecha_inicio < anio.fechaInicio or fecha_fin > anio.fechaFin:
                errores.append(
                    f"'{etiqueta}' está fuera del rango del año lectivo "
                    f"({anio.fechaInicio} al {anio.fechaFin})."
                )

        if fecha_anterior_fin is not None and fecha_inicio <= fecha_anterior_fin:
            errores.append(
                f"'{etiqueta}' se solapa o desordena con el período anterior."
            )
        fecha_anterior_fin = fecha_fin

        if dias_reales > dias_objetivo:
            errores.append(
                f"'{etiqueta}' tiene {dias_reales} días laborables y el máximo "
                f"reglamentario es {dias_objetivo}."
            )
        elif dias_reales < dias_objetivo - TOLERANCIA_DIAS:
            errores.append(
                f"'{etiqueta}' tiene {dias_reales} días laborables y se requieren "
                f"al menos {dias_objetivo - TOLERANCIA_DIAS} (esperado: {dias_objetivo}, "
                f"tolerancia por feriados: {TOLERANCIA_DIAS} días)."
            )

    return errores
