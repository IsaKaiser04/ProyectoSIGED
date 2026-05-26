from django.db import models

from .distributivo import Distributivo

# Descomentar cuando el módulo AsignaturaOfertada esté integrado
# from apps.asignaturas.models import AsignaturaOfertada

class DistributivoAsignatura(models.Model):
    distributivo = models.ForeignKey(
        Distributivo,
        on_delete=models.CASCADE,
        related_name='asignaturas'
    )

    # Referencia temporal mientras el módulo AsignaturaOfertada
    # aún no se encuentra integrado.
    asignatura_ofertada_referencia = models.CharField(
        max_length=150,
        help_text='TODO: replace with FK to AsignaturaOfertada when module exists.'
    )
    # Cuando se implemente la relación con AsignaturaOfertada,
    # se debe eliminar el campo asignatura_ofertada_referencia
    # y descomentar el siguiente código:
    # asignatura_ofertada = models.ForeignKey(
    #     AsignaturaOfertada,
    #     on_delete=models.CASCADE
    # )

    observacion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Distributivo Asignatura'
        verbose_name_plural = 'Distributivos Asignatura'

    def __str__(self):
        return f'{self.distributivo_id} - {self.asignatura_ofertada_referencia}'