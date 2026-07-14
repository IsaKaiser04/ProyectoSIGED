from django.db import models
from .enums import NotificacionTipo, EmailEstado


class Notificacion(models.Model):
    asunto = models.CharField(max_length=200)
    detalle = models.TextField()
    fechaReunion = models.DateTimeField(null=True, blank=True)
    emailEnviar = models.BooleanField(default=False)
    notificacionTipo = models.CharField(max_length=20, choices=NotificacionTipo.choices)
    emailEstado = models.CharField(max_length=20, choices=EmailEstado.choices, default=EmailEstado.PENDIENTE)

    # Remitente: Usuario del módulo Actores Académicos
    # Relación: Usuario (1) --remitente-- (1..n) Notificacion
    # COMENTADO: No se implementa en esta fase. Pertenece al módulo Actores Académicos.
    # remitente = models.ForeignKey('actoresAcademicos.Usuario', on_delete=models.CASCADE, related_name='notificaciones_enviadas')

    # Relaciones con otros módulos (todas comentadas)
    # DistributivoAsignatura (1) --comunicados o reuniones-- (0..n) Notificacion
    # distributivoAsignatura = models.ForeignKey('planificacion.DistributivoAsignatura', on_delete=models.CASCADE, null=True, blank=True, related_name='notificaciones')

    # Matricula (1) --se legaliza/anula la matrícula-- (0..n) Notificacion
    # matricula = models.ForeignKey('matricula.Matricula', on_delete=models.CASCADE, null=True, blank=True, related_name='notificaciones')

    # Incidencia (1) --acreditación y asistencia-- (0..1) Notificacion
    # incidencia = models.ForeignKey('acreditacion.Incidencia', on_delete=models.CASCADE, null=True, blank=True, related_name='notificacion')

    def __str__(self):
        return f"{self.notificacionTipo} - {self.asunto}"

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'