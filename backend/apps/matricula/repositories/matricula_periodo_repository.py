from apps.matricula.models import MatriculaPeriodo


class MatriculaPeriodoRepository:
    @staticmethod
    def get_all():
        return MatriculaPeriodo.objects.all()

    @staticmethod
    def get_by_id(pk):
        return MatriculaPeriodo.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return MatriculaPeriodo.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
