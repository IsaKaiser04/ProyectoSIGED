from django.db import models


class Promedio(models.Model):
    notaCuantitativa = models.DecimalField(max_digits=5, decimal_places=2)
    notaCualitativa = models.CharField(max_length=100, blank=True)
    distributivo_asignatura_id = models.PositiveBigIntegerField()
    matricula_id = models.PositiveBigIntegerField()

    def __str__(self):
        return str(self.notaCuantitativa)
