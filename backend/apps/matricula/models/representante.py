from django.db import models


class Representante(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    identificacion = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=15, blank=True, default='')
    parentesco = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        db_table = 'matricula_representante'
        verbose_name = 'Representante'
        verbose_name_plural = 'Representantes'

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"
