from django.db import transaction
from apps.asistencia.models import Asistencia, AsistenciaTipo


class AsistenciaRepository:

    @staticmethod
    def get_all():
        return Asistencia.objects.select_related('clase', 'matricula', 'registrado_por').all()

    @staticmethod
    def get_by_id(pk):
        return Asistencia.objects.select_related('clase', 'matricula', 'registrado_por').filter(pk=pk).first()

    @staticmethod
    def get_by_clase(clase_id):
        return Asistencia.objects.filter(clase_id=clase_id).select_related('matricula', 'registrado_por')

    @staticmethod
    def get_by_matricula(matricula_id):
        return Asistencia.objects.filter(matricula_id=matricula_id).select_related('clase', 'registrado_por')

    @staticmethod
    def get_by_matricula_y_periodo(matricula_id, fecha_inicio, fecha_fin):
        return Asistencia.objects.filter(
            matricula_id=matricula_id,
            clase__fecha__range=[fecha_inicio, fecha_fin]
        ).select_related('clase')

    @staticmethod
    def get_by_clase_y_matricula(clase_id, matricula_id):
        return Asistencia.objects.filter(clase_id=clase_id, matricula_id=matricula_id).first()

    @staticmethod
    def get_estadisticas_por_clase(clase_id):
        """Retorna conteo por tipo de asistencia para una clase."""
        return Asistencia.objects.filter(clase_id=clase_id).values('tipo').annotate(total=models.Count('id'))

    @staticmethod
    def get_estadisticas_por_paralelo_y_periodo(distributivo_id, fecha_inicio, fecha_fin):
        """Retorna estadísticas de asistencia para un paralelo en un rango de fechas."""
        from django.db.models import Count, Q
        return Asistencia.objects.filter(
            clase__distributivo_asignatura_id=distributivo_id,
            clase__fecha__range=[fecha_inicio, fecha_fin]
        ).values('tipo').annotate(total=Count('id'))

    @staticmethod
    def get_pendientes_por_docente(distributivo_id, fecha):
        """Clases sin asistencia registrada para un docente en una fecha."""
        from apps.asistencia.models import Clase
        clases = Clase.objects.filter(
            distributivo_asignatura_id=distributivo_id,
            fecha=fecha,
            estado__in=['PROGRAMADO', 'EN_CURSO']
        ).exclude(
            asistencias__isnull=False
        )
        return clases

    @staticmethod
    @transaction.atomic
    def create_bulk(asistencias_data):
        """Creación masiva de registros de asistencia."""
        registros = [
            Asistencia(**data) for data in asistencias_data
        ]
        return Asistencia.objects.bulk_create(registros, ignore_conflicts=True)

    @staticmethod
    def create(data):
        return Asistencia.objects.create(**data)

    @staticmethod
    def update(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def update_tipo_masivo(clase_id, matricula_ids, nuevo_tipo, usuario):
        """Actualiza el tipo de asistencia para múltiples alumnos en una clase."""
        Asistencia.objects.filter(
            clase_id=clase_id,
            matricula_id__in=matricula_ids
        ).update(tipo=nuevo_tipo, registrado_por=usuario)

    @staticmethod
    def delete(instance):
        instance.delete()

    @staticmethod
    def existe_registro(clase_id, matricula_id):
        return Asistencia.objects.filter(clase_id=clase_id, matricula_id=matricula_id).exists()


# Import al final para evitar circular
from django.db import models
