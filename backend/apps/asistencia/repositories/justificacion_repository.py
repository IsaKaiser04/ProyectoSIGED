from apps.asistencia.models import Justificacion, JustificacionEstado


class JustificacionRepository:

    @staticmethod
    def get_all():
        return Justificacion.objects.select_related(
            'asistencia', 'asistencia__clase', 'asistencia__matricula',
            'solicitado_por', 'resuelto_por'
        ).all()

    @staticmethod
    def get_by_id(pk):
        return Justificacion.objects.select_related(
            'asistencia', 'asistencia__clase', 'asistencia__matricula',
            'solicitado_por', 'resuelto_por'
        ).filter(pk=pk).first()

    @staticmethod
    def get_pendientes():
        return Justificacion.objects.filter(
            estado=JustificacionEstado.PENDIENTE
        ).select_related('asistencia__matricula', 'solicitado_por')

    @staticmethod
    def get_by_matricula(matricula_id):
        return Justificacion.objects.filter(
            asistencia__matricula_id=matricula_id
        ).select_related('asistencia__clase')

    @staticmethod
    def get_by_asistencia(asistencia_id):
        return Justificacion.objects.filter(asistencia_id=asistencia_id)

    @staticmethod
    def create(data):
        return Justificacion.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.delete()
