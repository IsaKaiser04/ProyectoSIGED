from django.db import models

class PeriodoTipo(models.TextChoices):
    BIMESTRE = 'Bimestre', 'Bimestre'
    TRIMESTRE = 'Trimestre', 'Trimestre'
    QUIMESTRE = 'Quimestre', 'Quimestre'
