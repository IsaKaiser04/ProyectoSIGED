from apps.matricula.models import Matricula, MatriculaEstado
from django.db.models import Count


class MatriculaRepository:
    @staticmethod
    def get_all():
        return Matricula.objects.select_related('matricula_periodo').all()

    @staticmethod
    def get_by_id(pk):
        return Matricula.objects.select_related('matricula_periodo').filter(pk=pk).first()

    @staticmethod
    def get_by_estudiante(estudiante_id):
        return Matricula.objects.filter(estudiante_id=estudiante_id).select_related('matricula_periodo')

    @staticmethod
    def get_by_paralelo(paralelo_id):
        return Matricula.objects.filter(paralelo_id=paralelo_id, estado=MatriculaEstado.LEGALIZADA).select_related('matricula_periodo')

    @staticmethod
    def get_por_estado(estado):
        return Matricula.objects.filter(estado=estado).select_related('matricula_periodo')

    @staticmethod
    def get_por_periodo(periodo_id):
        return Matricula.objects.filter(matricula_periodo_id=periodo_id).select_related('matricula_periodo')

    @staticmethod
    def get_con_requisitos(pk):
        return Matricula.objects.prefetch_related('requisitos__matricula_requisito').filter(pk=pk).first()

    @staticmethod
    def existe_legalizada(estudiante_id, anio_lectivo_id):
        return Matricula.objects.filter(
            estudiante_id=estudiante_id,
            anio_lectivo_id=anio_lectivo_id,
            estado=MatriculaEstado.LEGALIZADA
        ).exists()

    @staticmethod
    def get_estadisticas_por_estado():
        return Matricula.objects.values('estado').annotate(total=Count('id'))

    @staticmethod
    def get_conteo_por_paralelo(paralelo_ids):
        return Matricula.objects.filter(
            paralelo_id__in=paralelo_ids,
            estado=MatriculaEstado.LEGALIZADA
        ).values('paralelo_id').annotate(total=Count('id'))

    @staticmethod
    def create(data):
        return Matricula.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
