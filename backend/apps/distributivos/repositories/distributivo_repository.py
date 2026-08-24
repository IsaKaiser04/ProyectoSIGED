from ..models import Distributivo


class DistributivoRepository:
    @staticmethod
    def get_all(institucion_id=None):
        qs = Distributivo.objects.select_related('docente', 'anio_lectivo').all()
        if institucion_id is not None:
            qs = qs.filter(anio_lectivo__institucion_id=institucion_id)
        return qs

    @staticmethod
    def get_by_id(pk):
        return Distributivo.objects.select_related('docente', 'anio_lectivo').filter(pk=pk).first()

    @staticmethod
    def filter_by_anio_lectivo(anio_lectivo_id, institucion_id=None):
        qs = Distributivo.objects.select_related('docente', 'anio_lectivo').filter(anio_lectivo_id=anio_lectivo_id)
        if institucion_id is not None:
            qs = qs.filter(anio_lectivo__institucion_id=institucion_id)
        return qs

    @staticmethod
    def filter_by_docente(docente_id, institucion_id=None):
        qs = Distributivo.objects.select_related('docente', 'anio_lectivo').filter(docente_id=docente_id)
        if institucion_id is not None:
            qs = qs.filter(anio_lectivo__institucion_id=institucion_id)
        return qs

    @staticmethod
    def create(data):
        instance = Distributivo(**data)
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
        return Distributivo.objects.filter(pk=pk).delete()
