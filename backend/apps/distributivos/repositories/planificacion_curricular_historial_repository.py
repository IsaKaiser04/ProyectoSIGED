from ..models import PlanificacionCurricularHistorial


class PlanificacionCurricularHistorialRepository:
    @staticmethod
    def get_all():
        return PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').all()

    @staticmethod
    def get_by_id(pk):
        return PlanificacionCurricularHistorial.objects.select_related('planificacion_curricular').filter(pk=pk).first()

    @staticmethod
    def filter_by_planificacion(planificacion_id):
        return PlanificacionCurricularHistorial.objects.filter(planificacion_curricular_id=planificacion_id)

    @staticmethod
    def create(data):
        instance = PlanificacionCurricularHistorial(**data)
        instance.full_clean()
        instance.save()
        return instance
