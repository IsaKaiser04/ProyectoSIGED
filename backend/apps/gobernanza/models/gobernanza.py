from django.db import models
from .enums import GobernanzaTipo


class Gobernanza(models.Model):
   
    # Archivo digital del documento (PDF, Word, etc.)
    archivo = models.FileField(upload_to='gobernanza/documentos/')
    vigenteDesde = models.DateTimeField()
    vigenteHasta = models.DateTimeField()
    
    gobernanzaTipo = models.CharField(
        max_length=50,
        choices=GobernanzaTipo.choices
    )

    # Institución a la que pertenece el documento
    # Relación: Institucion (1) ---- (1..n) Gobernanza
    # COMENTADO: Pertenece al módulo Actores Académicos, no implementado aún
    """
    institucion = models.ForeignKey(
        'actoresAcademicos.Institucion',
        on_delete=models.CASCADE,
        related_name='gobernanzas'
    )
    """

    # Año lectivo al que aplica el documento
    # Relación: Gobernanza (1..3) ---- (1) AnioLectivo
    # COMENTADO: Pertenece al módulo Planificación, no implementado aún
    # Nota: El diagrama indica multiplicidad 1..3 del lado de Gobernanza,
    # lo que significa que un documento puede aplicar a máximo 3 años lectivos.
    # En Django esto se manejaría con ManyToManyField o ForeignKey según diseño.
    """
    anioLectivo = models.ForeignKey(
        'planificacion.AnioLectivo',
        on_delete=models.CASCADE,
        related_name='gobernanzas'
    )
    """

    def __str__(self):
        return f"{self.get_gobernanzaTipo_display()} - {self.vigenteDesde.year}"

    class Meta:
        verbose_name = 'Gobernanza'
        verbose_name_plural = 'Gobernanza'