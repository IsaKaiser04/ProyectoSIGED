from django.db import models


class EvaluacionTipo(models.TextChoices):
    CUALITATIVA = 'CUALITATIVA', 'Cualitativa'
    CUANTITATIVA = 'CUANTITATIVA', 'Cuantitativa'