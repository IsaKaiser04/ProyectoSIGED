from ..models import Distributivo


class DistributivoRepository:
    @staticmethod
    def get_all():
        return Distributivo.objects.select_related('docente', 'anio_lectivo').all()

    @staticmethod
    def get_by_id(pk):
        return Distributivo.objects.select_related('docente', 'anio_lectivo').filter(pk=pk).first()

    @staticmethod
    def filter_by_anio_lectivo(anio_lectivo_id):
        return Distributivo.objects.select_related('docente', 'anio_lectivo').filter(anio_lectivo_id=anio_lectivo_id)

    @staticmethod
    def filter_by_docente(docente_id):
        return Distributivo.objects.select_related('docente', 'anio_lectivo').filter(docente_id=docente_id)

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
