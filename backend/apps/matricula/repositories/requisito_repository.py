from apps.matricula.models import Requisito


class RequisitoRepository:
    @staticmethod
    def get_all():
        return Requisito.objects.select_related('matricula_requisito', 'revisado_por').all()

    @staticmethod
    def get_by_id(pk):
        return Requisito.objects.select_related('matricula_requisito', 'revisado_por').filter(pk=pk).first()

    @staticmethod
    def get_por_matricula(matricula_id):
        return Requisito.objects.filter(matricula_id=matricula_id).select_related('matricula_requisito', 'revisado_por')

    @staticmethod
    def get_pendientes_por_matricula(matricula_id):
        from apps.matricula.models import RequisitoEstado
        return Requisito.objects.filter(
            matricula_id=matricula_id
        ).exclude(estado=RequisitoEstado.VALIDADO).select_related('matricula_requisito')

    @staticmethod
    def create(data):
        return Requisito.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
