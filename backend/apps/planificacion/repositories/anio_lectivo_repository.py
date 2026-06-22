from ..models import AnioLectivo, PeriodoAcademico
from ..models.enums import AnioLectivoEstado


class AnioLectivoRepository:
    @staticmethod
    def get_all():
        return AnioLectivo.objects.all().order_by('-fechaInicio')

    @staticmethod
    def get_activos():
        return AnioLectivo.objects.filter(estado=AnioLectivoEstado.ACTIVO)

    @staticmethod
    def get_by_id(pk):
        return AnioLectivo.objects.filter(pk=pk).first()

    @staticmethod
    def get_periodos(anio_id):
        return PeriodoAcademico.objects.filter(anioLectivo_id=anio_id).order_by('fechaInicio')

    @staticmethod
    def create(data):
        return AnioLectivo.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance

    @staticmethod
    def delete(pk):
        return AnioLectivo.objects.filter(pk=pk).delete()
