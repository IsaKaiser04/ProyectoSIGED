from django.db import models


class CalificacionMejoraTipo(models.TextChoices):
    REFUERZO = 'REFUERZO', 'Refuerzo'
    PEDAGOGICO = 'PEDAGOGICO', 'Pedagógico'
    MEJORA = 'MEJORA', 'Mejora'
    
