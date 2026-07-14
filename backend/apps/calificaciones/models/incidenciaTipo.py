from django.db import models


class IncidenciaTipo(models.TextChoices):
    COMPORTAMIENTO = 'COMPORTAMIENTO', 'Comportamiento'
    ACADEMICO = 'ACADEMICO', 'Académico'
    ASISTENCIAL = 'ASISTENCIAL', 'Asistencial'
