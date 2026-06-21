from ..models import Horario


class HorarioRepository:
    @staticmethod
    def all():
        return Horario.objects.select_related(
            'distributivo',
            'distributivo_asignatura',
            'jornada_hora',
        ).all()

    @staticmethod
    def get_by_id(pk):
        return Horario.objects.select_related(
            'distributivo',
            'distributivo_asignatura',
            'jornada_hora',
        ).filter(pk=pk).first()

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance