from apps.asistencia.models import Clase


class ClaseRepository:
    @staticmethod
    def get_all():
        return Clase.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Clase.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return Clase.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()