from ..models import DistributivoAsignatura


class DistributivoAsignaturaRepository:
    @staticmethod
    def get_all():
        return DistributivoAsignatura.objects.select_related(
            'distributivo', 'distributivo__docente', 'asignatura_ofertada', 'paralelo'
        ).all()

    @staticmethod
    def get_by_id(pk):
        return DistributivoAsignatura.objects.select_related(
            'distributivo', 'distributivo__docente', 'asignatura_ofertada', 'paralelo'
        ).filter(pk=pk).first()

    @staticmethod
    def filter_by_distributivo(distributivo_id):
        return DistributivoAsignatura.objects.select_related('asignatura_ofertada', 'paralelo').filter(
            distributivo_id=distributivo_id
        )

    @staticmethod
    def filter_by_docente_cuenta(cuenta_id):
        return DistributivoAsignatura.objects.select_related(
            'distributivo', 'distributivo__docente',
            'asignatura_ofertada', 'asignatura_ofertada__gradoOfertado',
            'paralelo', 'planificacion_curricular'
        ).filter(distributivo__docente__cuenta_id=cuenta_id)

    @staticmethod
    def create(data):
        instance = DistributivoAsignatura(**data)
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
        return DistributivoAsignatura.objects.filter(pk=pk).delete()
