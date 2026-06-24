from django.db import models


class MatriculaRequisitoTipo(models.TextChoices):
    INFORMATIVO = 'Informativo', 'Informativo'
    EVIDENCIA = 'Evidencia', 'Evidencia'


class MatriculaPeriodoTipo(models.TextChoices):
    ORDINARIA = 'Ordinaria', 'Ordinaria'
    EXTRAORDINARIA = 'Extraordinaria', 'Extraordinaria'
    ESPECIAL = 'Especial', 'Especial'


class MatriculaEstado(models.TextChoices):
    PREMATRICULA = 'Prematricula', 'Prematricula'
    SOLICITUD = 'Solicitud', 'Solicitud'
    LEGALIZADA = 'Legalizada', 'Legalizada'
    RECHAZADA = 'Rechazada', 'Rechazada'
    ANULADA = 'Anulada', 'Anulada'


class RequisitoEstado(models.TextChoices):
    PENDIENTE = 'Pendiente', 'Pendiente'
    VALIDADO = 'Validado', 'Validado'
    NO_VALIDADO = 'No validado', 'No validado'
