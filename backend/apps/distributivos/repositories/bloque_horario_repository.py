from ..models import BloqueHorario


class BloqueHorarioRepository:
    @staticmethod
    def get_all():
        return BloqueHorario.objects.select_related(
            'paralelo', 'paralelo__gradoOfertado', 'jornada_hora',
        ).all()

    @staticmethod
    def get_by_id(pk):
        return BloqueHorario.objects.select_related(
            'paralelo', 'paralelo__gradoOfertado', 'jornada_hora',
        ).filter(pk=pk).first()

    @staticmethod
    def filter_by_paralelo(paralelo_id):
        return BloqueHorario.objects.select_related('jornada_hora').filter(
            paralelo_id=paralelo_id
        )

    @staticmethod
    def create(data):
        instance = BloqueHorario(**data)
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
        return BloqueHorario.objects.filter(pk=pk).delete()
