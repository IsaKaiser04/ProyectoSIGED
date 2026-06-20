from apps.asistencia.models import Clase, ClaseEstado


class ClaseRepository:

    @staticmethod
    def get_all():
        return Clase.objects.all()

    @staticmethod
    def get_by_id(pk):
        return Clase.objects.filter(pk=pk).first()

    @staticmethod
    def get_by_distributivo(distributivo_id):
        return Clase.objects.filter(distributivo_asignatura_id=distributivo_id)

    @staticmethod
    def get_by_distributivo_y_fecha(distributivo_id, fecha):
        return Clase.objects.filter(
            distributivo_asignatura_id=distributivo_id,
            fecha=fecha
        )

    @staticmethod
    def get_by_estado(estado):
        return Clase.objects.filter(estado=estado)

    @staticmethod
    def get_clases_semana(distributivo_id, fecha_inicio, fecha_fin):
        return Clase.objects.filter(
            distributivo_asignatura_id=distributivo_id,
            fecha__range=[fecha_inicio, fecha_fin]
        ).order_by('fecha', 'hora_inicio')

    @staticmethod
    def get_con_asistencias(clase_id):
        return Clase.objects.filter(pk=clase_id).prefetch_related('asistencias__matricula').first()

    @staticmethod
    def create(data):
        return Clase.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def cambiar_estado(clase_id, nuevo_estado):
        Clase.objects.filter(pk=clase_id).update(estado=nuevo_estado)

    @staticmethod
    def delete(instance):
        instance.delete()
