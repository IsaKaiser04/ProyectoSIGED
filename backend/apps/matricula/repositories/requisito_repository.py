from apps.matricula.models import Requisito


class RequisitoRepository:
    @staticmethod
    def get_all():
        return Requisito.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Requisito.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return Requisito.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
