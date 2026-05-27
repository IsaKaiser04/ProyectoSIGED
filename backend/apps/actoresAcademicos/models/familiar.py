from django.db import models
from .usuario import Usuario

class Familiar(Usuario):
    # Un familiar puede o no ser el representante legal que firma la matrícula
    es_representante = models.BooleanField(default=False)
    ocupacion = models.CharField(max_length=100)
    # ... relación con estudiante y parentesco