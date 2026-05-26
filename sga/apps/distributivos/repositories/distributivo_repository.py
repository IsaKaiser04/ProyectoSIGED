from ..models import Distributivo


class DistributivoRepository:
    @staticmethod
    def all():
        return Distributivo.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Distributivo.objects.filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance
