from ..models import AdaptacionCurricularEvidencia


class AdaptacionCurricularEvidenciaRepository:
    @staticmethod
    def all():
        return AdaptacionCurricularEvidencia.objects.select_related('adaptacion_curricular').all()

    @staticmethod
    def get_by_id(pk):
        return AdaptacionCurricularEvidencia.objects.select_related('adaptacion_curricular').filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance
