from ..models import AnioLectivo, PeriodoAcademico
from ..models.enums import AnioLectivoEstado


class AnioLectivoRepository:
    @staticmethod
    def get_all(institucion_id=None):
        qs = AnioLectivo.objects.filter(eliminado=False)
        if institucion_id is not None:
            qs = qs.filter(institucion_id=institucion_id)
        return qs.order_by('-fechaInicio')

    @staticmethod
    def get_activos(institucion_id=None):
        qs = AnioLectivo.objects.filter(estado=AnioLectivoEstado.ACTIVO, eliminado=False)
        if institucion_id is not None:
            qs = qs.filter(institucion_id=institucion_id)
        return qs

    @staticmethod
    def get_by_id(pk, institucion_id=None):
        qs = AnioLectivo.objects.filter(pk=pk, eliminado=False)
        if institucion_id is not None:
            qs = qs.filter(institucion_id=institucion_id)
        return qs.first()

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
    def soft_delete(pk):
        return AnioLectivo.objects.filter(pk=pk).update(eliminado=True)
