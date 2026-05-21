from django.db import models


class TipoIdentificacion(models.TextChoices):
    CEDULA = 'CEDULA', 'Cédula'
    PASAPORTE = 'PASAPORTE', 'Pasaporte'


class RolTipo(models.TextChoices):
    ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'
    AUTORIDAD = 'AUTORIDAD', 'Autoridad Académica'
    DOCENTE = 'DOCENTE', 'Docente'
    DOCEENTE_TUTOR = 'DOCENTE_TUTOR', 'Docente Tutor'
    SECRETARIA = 'SECRETARIA', 'Secretaria'
    ESTUDIANTE = 'ESTUDIANTE', 'Estudiante'
    DECE = 'DECE', 'DECE'