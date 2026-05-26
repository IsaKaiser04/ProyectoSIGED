from django.db import models

class ZonasCoordinacion(models.TextChoices):
    ZONA_1 = 'Z1', 'Coordinación Zonal 1'
    ZONA_2 = 'Z2', 'Coordinación Zonal 2'
    ZONA_3 = 'Z3', 'Coordinación Zonal 3'
    ZONA_4 = 'Z4', 'Coordinación Zonal 4'
    ZONA_5 = 'Z5', 'Coordinación Zonal 5'
    ZONA_6 = 'Z6', 'Coordinación Zonal 6'
    ZONA_7 = 'Z7', 'Coordinación Zonal 7'
    ZONA_8 = 'Z8', 'Coordinación Zonal 8'
    ZONA_9 = 'Z9', 'Coordinación Zonal 9'

class Regimen(models.TextChoices):
    COSTA_GALAPAGOS = 'CG', 'Costa-Galápagos'
    SIERRA_AMAZONIA = 'SA', 'Sierra-Amazonía'

class Sostenimiento(models.TextChoices):
    PARTICULAR = 'PAR', 'Particular'
    FISCOMISIONAL = 'FIS', 'Fiscomisional'
    MUNICIPAL = 'MUN', 'Municipal'

class Modalidad(models.TextChoices):
    PRESENCIAL = 'PR', 'Presencial'
    SEMIPRESENCIAL = 'SP', 'Semipresencial'
    A_DISTANCIA = 'AD', 'A distancia'
    EN_LINEA = 'EL', 'En línea'

class Jornada(models.TextChoices):
    MATUTINO = 'MAT', 'Matutino'
    VESPERTINO = 'VES', 'Vespertino'
    NOCTURNO = 'NOC', 'Nocturno'