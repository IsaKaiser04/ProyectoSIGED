from django.db import models


class GobernanzaTipo(models.TextChoices):

    #Tipos de documentos de gobernanza institucional.

    PROYECTO_EDUCATIVO = 'PROYECTO_EDUCATIVO', 'Proyecto Educativo Institucional'
    CODIGO_CONVIVENCIA = 'CODIGO_CONVIVENCIA', 'Código de Convivencia'
    PLAN_GESTION_RIESGO = 'PLAN_GESTION_RIESGO', 'Plan de Gestión de Riesgo'