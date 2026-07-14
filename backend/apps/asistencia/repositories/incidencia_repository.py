from apps.asistencia.models import Incidencia


class IncidenciaRepository:
    @staticmethod
    def get_all():
        return Incidencia.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Incidencia.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return Incidencia.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()