from django.db import models


class NotificacionTipo(models.TextChoices):
    INFORMATIVA = 'INFORMATIVA', 'Informativa'
    REUNION = 'REUNION', 'Reunión'
    INCIDENCIA = 'INCIDENCIA', 'Incidencia'


class EmailEstado(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'
    ENVIADO = 'ENVIADO', 'Enviado'