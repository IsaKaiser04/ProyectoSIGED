from ..models import JornadaHora


class JornadaHoraRepository:
    @staticmethod
    def get_all():
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
    def create(data):
        instance = JornadaHora(**data)
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
        return JornadaHora.objects.filter(pk=pk).delete()
