from apps.asistencia.models import Incidencia


class IncidenciaRepository:

    @staticmethod
    def get_all():
        return Incidencia.objects.select_related('asistencia', 'matricula', 'registrado_por').all()

    @staticmethod
    def get_by_id(pk):
        return Incidencia.objects.select_related('asistencia', 'matricula', 'registrado_por').filter(pk=pk).first()

    @staticmethod
    def get_by_asistencia(asistencia_id):
        return Incidencia.objects.filter(asistencia_id=asistencia_id)

    @staticmethod
    def get_by_matricula(matricula_id):
        return Incidencia.objects.filter(matricula_id=matricula_id)

    @staticmethod
    def get_pendientes():
        return Incidencia.objects.filter(estado='REGISTRADA')

    @staticmethod
    def get_by_tipo(tipo):
        return Incidencia.objects.filter(tipo=tipo)

    @staticmethod
    def get_by_periodo(matricula_id, fecha_inicio, fecha_fin):
        return Incidencia.objects.filter(
            matricula_id=matricula_id,
            fecha_registro__date__range=[fecha_inicio, fecha_fin]
        )

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
