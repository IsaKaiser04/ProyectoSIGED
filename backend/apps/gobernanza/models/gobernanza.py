from django.db import models
from .enums import GobernanzaTipo
from apps.institucion.models.institucion import Institucion


class Gobernanza(models.Model):

    archivo = models.FileField(upload_to='gobernanza/documentos/')
    vigenteDesde = models.DateTimeField()
    vigenteHasta = models.DateTimeField()
    es_activo = models.BooleanField(default=True)

    gobernanzaTipo = models.CharField(
        max_length=50,
        choices=GobernanzaTipo.choices
    )

    institucion = models.ForeignKey(
        Institucion,
        on_delete=models.CASCADE,
        related_name='gobernanzas',
        verbose_name='Institución'
    )

    anioLectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.CASCADE,
        related_name='gobernanzas',
        verbose_name='Año Lectivo'
    )

    class Meta:
        verbose_name = 'Gobernanza'
        verbose_name_plural = 'Gobernanza'
        unique_together = ('institucion', 'anioLectivo', 'gobernanzaTipo')

    def __str__(self):
        return f"{self.get_gobernanzaTipo_display()} - {self.institucion.nombre} - {self.anioLectivo.nombre}"