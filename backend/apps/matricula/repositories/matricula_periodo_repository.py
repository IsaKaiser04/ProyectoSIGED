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
        requisitos = data.pop('requisitos', None)
        instance = MatriculaPeriodo.objects.create(**data)
        if requisitos:
            instance.requisitos.set(requisitos)
        return instance

    @staticmethod
    def update(instance, data):
        requisitos = data.pop('requisitos', None)
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        if requisitos is not None:
            instance.requisitos.set(requisitos)
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
