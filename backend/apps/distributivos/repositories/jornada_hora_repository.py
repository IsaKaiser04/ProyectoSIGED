from ..models import JornadaHora


class JornadaHoraRepository:
    @staticmethod
    def all():
        return JornadaHora.objects.select_related('institucion').all()

    @staticmethod
    def get_by_id(pk):
        return JornadaHora.objects.select_related('institucion').filter(pk=pk).first()

    @staticmethod
    def filter_by_institucion(institucion_id):
        if institucion_id is None:
            return JornadaHora.objects.select_related('institucion').all()
        return JornadaHora.objects.select_related('institucion').filter(institucion_id=institucion_id)

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance
