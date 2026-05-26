from apps.asistencia.models import Incidencia
from apps.asistencia.serializers.incidencia_serializer import IncidenciaSerializer


class IncidenciaService:

    @staticmethod
    def list_all():
        incidencias = Incidencia.objects.all()
        return IncidenciaSerializer(incidencias, many=True).data

    @staticmethod
    def retrieve(pk):
        try:
            incidencia = Incidencia.objects.get(pk=pk)
            return IncidenciaSerializer(incidencia).data
        except Incidencia.DoesNotExist:
            return None

    @staticmethod
    def create(data):
        serializer = IncidenciaSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        try:
            incidencia = Incidencia.objects.get(pk=pk)
        except Incidencia.DoesNotExist:
            return None, None

        serializer = IncidenciaSerializer(incidencia, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        try:
            incidencia = Incidencia.objects.get(pk=pk)
            incidencia.delete()
            return True
        except Incidencia.DoesNotExist:
            return False