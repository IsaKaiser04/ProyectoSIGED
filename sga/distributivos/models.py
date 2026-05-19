from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Distributivo(models.Model):
    docente = models.CharField(max_length=100)
    materia = models.CharField(max_length=100)
    paralelo = models.CharField(max_length=10)
    horas = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(40)]
    )
    horario = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['docente', 'horario'],
                name='unique_docente_horario'
            )
        ]
        ordering = ['-created_at']
        verbose_name = 'Distributivo'
        verbose_name_plural = 'Distributivos'

    def __str__(self):
        return f"{self.docente} - {self.materia} ({self.horario})"
