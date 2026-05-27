from apps.asistencia.models import Asistencia
from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer


class AsistenciaService:

    @staticmethod
    def list_all():
        asistencias = Asistencia.objects.all()
        return AsistenciaSerializer(asistencias, many=True).data

    @staticmethod
    def retrieve(pk):
        try:
            asistencia = Asistencia.objects.get(pk=pk)
            return AsistenciaSerializer(asistencia).data
        except Asistencia.DoesNotExist:
            return None

    @staticmethod
    def create(data):
        serializer = AsistenciaSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        try:
            asistencia = Asistencia.objects.get(pk=pk)
        except Asistencia.DoesNotExist:
            return None, None

        serializer = AsistenciaSerializer(asistencia, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        try:
            asistencia = Asistencia.objects.get(pk=pk)
            asistencia.delete()
            return True
        except Asistencia.DoesNotExist:
            return False