from django.db import models


class PeriodoTipo(models.TextChoices):
    BIMESTRE = 'BIMESTRE', 'Bimestre'
    TRIMESTRE = 'TRIMESTRE', 'Trimestre'
    QUIMESTRE = 'QUIMESTRE', 'Quimestre'
