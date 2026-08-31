from apps.matricula.models import MatriculaRequisito


class MatriculaRequisitoRepository:
    @staticmethod
    def get_all(educacion_nivel=None):
        qs = MatriculaRequisito.objects.all()
        if educacion_nivel:
            qs = qs.filter(educacion_nivel=educacion_nivel)
        return qs

    @staticmethod
    def get_by_id(pk):
        return MatriculaRequisito.objects.filter(pk=pk).first()

    @staticmethod
    def create(data):
        return MatriculaRequisito.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
