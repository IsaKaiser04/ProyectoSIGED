from django.db import models
from enum import Enum


class PeriodoTipo(models.TextChoices):
    BIMESTRE = 'BIMESTRE', 'Bimestre'
    TRIMESTRE = 'TRIMESTRE', 'Trimestre'
    QUIMESTRE = 'QUIMESTRE', 'Quimestre'


class AnioLectivoEstado(models.TextChoices):
    BORRADOR = 'BORRADOR', 'Borrador'
    ACTIVO = 'ACTIVO', 'Activo'
    CERRADO = 'CERRADO', 'Cerrado'


class NivelEducativo(Enum):
    """
    Niveles del sistema educativo ecuatoriano.
    Fuente: Ministerio de Educación del Ecuador.
    """
    INICIAL = "Educación Inicial"
    EGB = "Educación General Básica"
    BACHILLERATO = "Bachillerato"


class SubNivelEducativo(Enum):
    """
    Subniveles del sistema educativo ecuatoriano.
    Cada subnivel pertenece a un nivel específico.
    """
    # ─── Educación Inicial ───────────────────────────────────
    INICIAL_1 = "Inicial 1 (No Escolarizado)"
    INICIAL_2 = "Inicial 2 (Escolarizado)"

    # ─── Educación General Básica (EGB) ─────────────────────
    PREPARATORIA = "Preparatoria (1° EGB)"
    BASICA_ELEMENTAL = "Básica Elemental (2°-4° EGB)"
    BASICA_MEDIA = "Básica Media (5°-7° EGB)"
    BASICA_SUPERIOR = "Básica Superior (8°-10° EGB)"

    # ─── Bachillerato ───────────────────────────────────────
    BACHILLERATO_CIENCIAS = "Bachillerato en Ciencias"
    BACHILLERATO_TECNICO = "Bachillerato Técnico"


class ModalidadBachillerato(Enum):
    """
    Modalidades del Bachillerato.
    """
    CIENCIAS = "Bachillerato en Ciencias"
    TECNICO = "Bachillerato Técnico"


NIVEL_SUBNIVELES_MAP = {
    NivelEducativo.INICIAL.value: [
        SubNivelEducativo.INICIAL_1.value,
        SubNivelEducativo.INICIAL_2.value,
    ],
    NivelEducativo.EGB.value: [
        SubNivelEducativo.PREPARATORIA.value,
        SubNivelEducativo.BASICA_ELEMENTAL.value,
        SubNivelEducativo.BASICA_MEDIA.value,
        SubNivelEducativo.BASICA_SUPERIOR.value,
    ],
    NivelEducativo.BACHILLERATO.value: [
        SubNivelEducativo.BACHILLERATO_CIENCIAS.value,
        SubNivelEducativo.BACHILLERATO_TECNICO.value,
    ],
}
