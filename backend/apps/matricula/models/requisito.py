from django.db import models
from django.conf import settings
from .enums import RequisitoEstado


class Requisito(models.Model):
    archivo = models.FileField(upload_to='matricula/requisitos/', null=True, blank=True)
    observacion = models.TextField(blank=True, default='')
    estado = models.CharField(max_length=20, choices=RequisitoEstado.choices, default=RequisitoEstado.PENDIENTE)
    matricula = models.ForeignKey('Matricula', on_delete=models.CASCADE, related_name='requisitos')
    matricula_requisito = models.ForeignKey('MatriculaRequisito', on_delete=models.PROTECT, related_name='requisitos_entregados')

    revisado_por = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='requisitos_revisados', on_delete=models.SET_NULL, null=True, blank=True)
    fecha_revision = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'requisito'
        verbose_name = 'Requisito Entregado'
        verbose_name_plural = 'Requisitos Entregados'

    def __str__(self):
        return f"Requisito #{self.id} - {self.estado}"
