from django.db import models


class Destinatario(models.Model):
    confirmacion = models.BooleanField(default=False)
    visto = models.BooleanField(default=False)
    vistoFecha = models.DateTimeField(null=True, blank=True)
    emailFechaEnvio = models.DateTimeField(null=True, blank=True)

    # Notificacion (1) --destinatarios-- (1..n) Destinatario
    notificacion = models.ForeignKey('Notificacion', on_delete=models.CASCADE, related_name='destinatarios')

    # Usuario (1) --destinatarios-- (0..n) Destinatario
    # COMENTADO: No se implementa en esta fase. Pertenece al módulo Actores Académicos.
    # usuario = models.ForeignKey('actoresAcademicos.Usuario', on_delete=models.CASCADE, related_name='notificaciones_recibidas')

    def __str__(self):
        return f"Destinatario de: {self.notificacion.asunto}"

    class Meta:
        verbose_name = 'Destinatario'
        verbose_name_plural = 'Destinatarios'
        # unique_together = ['notificacion', 'usuario']  # Cuando usuario esté implementado