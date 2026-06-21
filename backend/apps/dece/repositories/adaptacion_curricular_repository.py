from ..models import AdaptacionCurricular


class AdaptacionCurricularRepository:
    @staticmethod
    def all():
        return AdaptacionCurricular.objects.all()

    @staticmethod
    def get_by_id(pk):
        return AdaptacionCurricular.objects.filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance
