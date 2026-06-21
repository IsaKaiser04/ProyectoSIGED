from django.db import models

class TipoCalculo(models.TextChoices):
    SIMPLE = 'SIMPLE', 'Simple'
    PONDERADO = 'PONDERADO', 'Ponderado'
    SUPLETORIO = 'SUPLETORIO', 'Supletorio'
