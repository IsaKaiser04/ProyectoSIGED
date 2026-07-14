from django.db import models


class JornadaChoices(models.TextChoices):
    MATUTINA = 'MATUTINA', 'Matutina'
    VESPERTINA = 'VESPERTINA', 'Vespertina'
    NOCTURNA = 'NOCTURNA', 'Nocturna'


class Paralelo(models.Model):
    nombre = models.CharField(max_length=10)
    cuposMaximo = models.IntegerField()
    cuposOcupados = models.IntegerField(default=0)
    jornada = models.CharField(max_length=20, choices=JornadaChoices.choices, default=JornadaChoices.MATUTINA)
    gradoOfertado = models.ForeignKey('GradoOfertado', on_delete=models.CASCADE, related_name='paralelos')
    docenteTutor = models.ForeignKey(
        'actoresAcademicos.Docente',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='paralelos_tutor'
    )

    def clean(self):
        from django.core.exceptions import ValidationError
        super().clean()
        if self.docenteTutor:
            queryset = Paralelo.objects.filter(docenteTutor=self.docenteTutor)
            if self.pk:
                queryset = queryset.exclude(pk=self.pk)
            if queryset.exists():
                raise ValidationError({
                    'docenteTutor': 'Este docente ya es tutor de otro paralelo.'
                })

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = 'Paralelo'
        verbose_name_plural = 'Paralelos'