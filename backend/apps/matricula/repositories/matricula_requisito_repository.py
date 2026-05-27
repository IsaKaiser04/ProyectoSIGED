from apps.matricula.models import MatriculaRequisito


class MatriculaRequisitoRepository:
    @staticmethod
    def get_all():
        return MatriculaRequisito.objects.all()

    @staticmethod
    def get_by_id(pk):
        return MatriculaRequisito.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return MatriculaRequisito.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
