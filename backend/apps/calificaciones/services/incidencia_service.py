from django.db import transaction
from django.utils import timezone

from apps.calificaciones.models.Incidencia import Incidencia
from apps.calificaciones.models.incidenciaTipo import IncidenciaTipo


class IncidenciaService:

    @transaction.atomic
    def registrar_incidencia(self, asunto, detalle, tipo=IncidenciaTipo.COMPORTAMIENTO,
                             archivo=None, notificar=False, calificaciones=None):
        incidencia = Incidencia.objects.create(
            asunto=asunto,
            detalle=detalle,
            tipo=tipo,
            archivo=archivo,
            notificar=notificar,
        )
        if calificaciones:
            incidencia.calificaciones.set(calificaciones)
        return incidencia

    @transaction.atomic
    def resolver_incidencia(self, incidencia_id, detalle_resolucion=None):
        try:
            incidencia = Incidencia.objects.get(id=incidencia_id)
        except Incidencia.DoesNotExist:
            return None
        incidencia.detalle = f"{incidencia.detalle}\n[RESUELTO] {detalle_resolucion or ''}"
        incidencia.save()
        return incidencia
