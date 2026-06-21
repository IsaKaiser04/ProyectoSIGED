from ..models import DistributivoAsignatura


class DistributivoAsignaturaRepository:
    @staticmethod
    def all():
        return DistributivoAsignatura.objects.select_related('distributivo').all()

    @staticmethod
    def get_by_id(pk):
        return DistributivoAsignatura.objects.select_related('distributivo').filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance