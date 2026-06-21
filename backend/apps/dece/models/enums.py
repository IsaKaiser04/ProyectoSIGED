from django.db import models


class DiscapacidadTipo(models.TextChoices):
    VISUAL = 'VISUAL', 'Visual'
    AUDITIVA = 'AUDITIVA', 'Auditiva'
    FISICA = 'FISICA', 'Fisica'
    INTELECTUAL = 'INTELECTUAL', 'Intelectual'
    LENGUAJE = 'LENGUAJE', 'Lenguaje'
    PSICOSOCIAL = 'PSICOSOCIAL', 'Psicosocial'
    MULTIPLE = 'MULTIPLE', 'Multiple'


class DiscapacidadGrado(models.TextChoices):
    RANGO_0_4 = 'RANGO_0_4', '0-4'
    RANGO_5_24 = 'RANGO_5_24', '5-24'
    RANGO_25_49 = 'RANGO_25_49', '25-49'
    RANGO_50_74 = 'RANGO_50_74', '50-74'
    RANGO_75_95 = 'RANGO_75_95', '75-95'
    RANGO_96_100 = 'RANGO_96_100', '96-100'


class AdaptacionEstado(models.TextChoices):
    BORRADOR = 'BORRADOR', 'Borrador'
    ENVIADO = 'ENVIADO', 'Enviado'
    NO_APROBADO = 'NO_APROBADO', 'No aprobado'
    APROBADO = 'APROBADO', 'Aprobado'