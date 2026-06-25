from ..models import PlanificacionCurricular


class PlanificacionCurricularRepository:
    @staticmethod
    def get_all():
        return PlanificacionCurricular.objects.select_related(
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada'
        ).all()

    @staticmethod
    def get_by_id(pk):
        return PlanificacionCurricular.objects.select_related(
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada'
        ).filter(pk=pk).first()

    @staticmethod
    def get_con_historial(pk):
        return PlanificacionCurricular.objects.prefetch_related('historiales').select_related(
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada'
        ).filter(pk=pk).first()

    @staticmethod
    def create(data):
        instance = PlanificacionCurricular(**data)
        instance.full_clean()
        instance.save()
        return instance

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance

    @staticmethod
    def delete(pk):
        return PlanificacionCurricular.objects.filter(pk=pk).delete()
