from django.db import models

# Descomentar cuando el módulo AñoLectivo esté integrado
# from apps.anio_lectivo.models import AnioLectivo

# Descomentar cuando el módulo Docente esté integrado
# from apps.docentes.models import Docente

class Distributivo(models.Model):
    # Referencia temporal mientras el módulo AñoLectivo
    # aún no se encuentra integrado.    
    anio_lectivo_referencia = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='TODO: replace with FK to AñoLectivo when module exists.'
    )

    # Cuando se implemente la relación con AñoLectivo,
    # se debe eliminar el campo anio_lectivo_referencia
    # y descomentar el siguiente código:
    # anio_lectivo = models.ForeignKey(
    #     AnioLectivo,
    #     on_delete=models.CASCADE
    # )

    # Referencia temporal mientras el módulo Docente
    # aún no se encuentra integrado.
    docente_referencia = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text='TODO: replace with FK to Docente when module exists.'
    )
    # Cuando se implemente la relación con Docente,
    # se debe eliminar el campo docente_referencia
    # y descomentar el siguiente código:
    # docente = models.ForeignKey(
    #     Docente,
    #     on_delete=models.CASCADE
    # )

    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Distributivo'
        verbose_name_plural = 'Distributivos'

    def __str__(self):
        return f'{self.docente_referencia} - {self.anio_lectivo_referencia}'