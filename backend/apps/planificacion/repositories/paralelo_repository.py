from django.db import models
from ..models import Paralelo


class ParaleloRepository:
    @staticmethod
    def get_all():
        return Paralelo.objects.select_related(
            'gradoOfertado', 'gradoOfertado__grado',
            'gradoOfertado__ofertaAcademica',
            'gradoOfertado__ofertaAcademica__anioLectivo'
        ).all()

    @staticmethod
    def get_by_id(pk):
        return Paralelo.objects.select_related('gradoOfertado').filter(pk=pk).first()

    @staticmethod
    def get_by_grado_ofertado(grado_ofertado_id):
        return Paralelo.objects.filter(gradoOfertado_id=grado_ofertado_id).select_related(
            'gradoOfertado', 'gradoOfertado__grado',
            'gradoOfertado__ofertaAcademica',
            'gradoOfertado__ofertaAcademica__anioLectivo'
        )

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
