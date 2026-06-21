from ..models import PlanificacionCurricularHistorial


class PlanificacionCurricularHistorialRepository:
    @staticmethod
    def all():
        return PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').all()

    @staticmethod
    def get_by_id(pk):
        return PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance