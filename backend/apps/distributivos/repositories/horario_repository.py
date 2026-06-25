from ..models import Horario


class HorarioRepository:
    @staticmethod
    def get_all():
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'jornada_hora',
        ).all()

    @staticmethod
    def get_by_id(pk):
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'jornada_hora',
        ).filter(pk=pk).first()

    @staticmethod
    def filter_by_distributivo(distributivo_id):
        return Horario.objects.select_related(
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'jornada_hora',
        ).filter(distributivo_id=distributivo_id)

    @staticmethod
    def filter_by_distributivo_asignatura(distributivo_asignatura_id):
        return Horario.objects.select_related('jornada_hora').filter(
            distributivo_asignatura_id=distributivo_asignatura_id
        )

    @staticmethod
    def create(data):
        instance = Horario(**data)
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
        return Horario.objects.filter(pk=pk).delete()
