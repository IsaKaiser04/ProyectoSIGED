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

class TipoContrato(models.TextChoices):
    TITULAR = 'TIT', 'Titular'
    INVITADO = 'INV', 'Invitado'
    OCASIONAL = 'OCA', 'Ocasional'
    HONORARIOS = 'HON', 'Honorarios'
    EMERITOS = 'EME', 'Eméritos'

class TipoDedicacion(models.TextChoices):
    TIEMPO_COMPLETO = 'TC', 'Tiempo completo'
    TIEMPO_PARCIAL = 'TP', 'Tiempo parcial'
    MEDIO_TIEMPO = 'MT', 'Medio tiempo'