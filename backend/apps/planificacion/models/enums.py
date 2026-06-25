from django.db import models


class PeriodoTipo(models.TextChoices):
    BIMESTRE = 'BIMESTRE', 'Bimestre'
    TRIMESTRE = 'TRIMESTRE', 'Trimestre'
    QUIMESTRE = 'QUIMESTRE', 'Quimestre'


class AnioLectivoEstado(models.TextChoices):
    INACTIVO = 'INACTIVO', 'Inactivo'
    ACTIVO = 'ACTIVO', 'Activo'
