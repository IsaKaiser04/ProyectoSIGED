from django.db import models


class HorarioTipo(models.TextChoices):
    CLASE = 'CLASE', 'Clase'
    COMPLEMENTARIA = 'COMPLEMENTARIA', 'Complementaria'


class DiasSemana(models.TextChoices):
    LUNES = 'LUNES', 'Lunes'
    MARTES = 'MARTES', 'Martes'
    MIERCOLES = 'MIERCOLES', 'Miercoles'
    JUEVES = 'JUEVES', 'Jueves'
    VIERNES = 'VIERNES', 'Viernes'


class PlanificacionEstado(models.TextChoices):
    BORRADOR = 'BORRADOR', 'Borrador'
    POR_APROBAR = 'POR_APROBAR', 'Por aprobar'
    APROBADO = 'APROBADO', 'Aprobado'