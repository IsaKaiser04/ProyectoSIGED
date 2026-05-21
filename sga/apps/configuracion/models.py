from django.db import models


class Institucion(models.Model):
    nombre = models.CharField(max_length=150)

    def __str__(self):
        return self.nombre
