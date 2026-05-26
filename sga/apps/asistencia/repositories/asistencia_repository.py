from apps.asistencia.models import Asistencia


class AsistenciaRepository:
    @staticmethod
    def get_all():
        return Asistencia.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Asistencia.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return Asistencia.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()