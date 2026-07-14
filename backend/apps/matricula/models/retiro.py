from django.db import models


class Retiro(models.Model):
    fecha = models.DateField()
    motivo = models.TextField()
    matricula = models.ForeignKey('Matricula', on_delete=models.CASCADE, related_name='retiros')

    class Meta:
        db_table = 'retiro'
        verbose_name = 'Retiro'
        verbose_name_plural = 'Retiros'

    def __str__(self):
        return f"Retiro #{self.id} - {self.fecha}"
