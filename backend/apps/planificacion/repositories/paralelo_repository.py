from django.db import models
from django.db.models import Q
from ..models import Paralelo


class ParaleloRepository:
    @staticmethod
    def get_all(institucion_id=None):
        qs = Paralelo.objects.select_related(
            'gradoOfertado', 'gradoOfertado__grado',
            'gradoOfertado__ofertaAcademica',
            'gradoOfertado__ofertaAcademica__anioLectivo'
        ).all()
        if institucion_id is not None:
            qs = qs.filter(
                Q(gradoOfertado__grado__institucion_id=institucion_id)
                | Q(gradoOfertado__grado__planEstudio__institucion_id=institucion_id)
            )
        return qs

    @staticmethod
    def get_by_id(pk):
        return Paralelo.objects.select_related('gradoOfertado').filter(pk=pk).first()

    @staticmethod
    def get_by_grado_ofertado(grado_ofertado_id, institucion_id=None):
        qs = Paralelo.objects.filter(gradoOfertado_id=grado_ofertado_id).select_related(
            'gradoOfertado', 'gradoOfertado__grado',
            'gradoOfertado__ofertaAcademica',
            'gradoOfertado__ofertaAcademica__anioLectivo'
        )
        if institucion_id is not None:
            qs = qs.filter(
                Q(gradoOfertado__grado__institucion_id=institucion_id)
                | Q(gradoOfertado__grado__planEstudio__institucion_id=institucion_id)
            )
        return qs

    @staticmethod
    def get_con_cupos_disponibles():
        return Paralelo.objects.filter(cuposOcupados__lt=models.F('cuposMaximo'))

    @staticmethod
    def create(data):
        return Paralelo.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.full_clean()
        instance.save()
        return instance

    @staticmethod
    def delete(pk):
        return Paralelo.objects.filter(pk=pk).delete()
