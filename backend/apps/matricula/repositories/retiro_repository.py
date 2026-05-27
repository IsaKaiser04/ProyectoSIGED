from apps.matricula.models import Retiro


class RetiroRepository:
    @staticmethod
    def get_all():
        return Retiro.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Retiro.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return Retiro.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
