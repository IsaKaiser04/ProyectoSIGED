from ..models import Horario


class HorarioRepository:
    @staticmethod
    def get_all():
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'distributivo_asignatura__paralelo',
            'jornada_hora', 'bloque_horario',
        ).all()

    @staticmethod
    def get_by_id(pk):
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'distributivo_asignatura__paralelo',
            'jornada_hora', 'bloque_horario',
        ).filter(pk=pk).first()

    @staticmethod
    def filter_by_distributivo(distributivo_id):
        return Horario.objects.select_related(
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'distributivo_asignatura__paralelo',
            'jornada_hora', 'bloque_horario',
        ).filter(distributivo_id=distributivo_id)

    @staticmethod
    def filter_by_distributivo_asignatura(distributivo_asignatura_id):
        return Horario.objects.select_related(
            'jornada_hora', 'bloque_horario',
        ).filter(
            distributivo_asignatura_id=distributivo_asignatura_id
        )

    @staticmethod
    def filter_by_paralelo(paralelo_id):
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'distributivo_asignatura__paralelo',
            'jornada_hora', 'bloque_horario',
        ).filter(distributivo_asignatura__paralelo_id=paralelo_id)

    @staticmethod
    def filter_by_docente_cuenta(cuenta_id):
        return Horario.objects.select_related(
            'distributivo', 'distributivo__docente',
            'distributivo_asignatura', 'distributivo_asignatura__asignatura_ofertada',
            'distributivo_asignatura__paralelo',
            'jornada_hora', 'bloque_horario', 'bloque_horario__paralelo',
        ).filter(distributivo__docente__cuenta_id=cuenta_id)

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
