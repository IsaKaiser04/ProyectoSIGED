from ..models import PlanificacionCurricular


class PlanificacionCurricularRepository:
    @staticmethod
    def all():
        return PlanificacionCurricular.objects.select_related('distributivo_asignatura').all()

    @staticmethod
    def get_by_id(pk):
        return PlanificacionCurricular.objects.select_related('distributivo_asignatura').filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance