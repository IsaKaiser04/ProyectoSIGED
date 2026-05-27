from apps.asistencia.models import Clase
from apps.asistencia.serializers.clase_serializer import ClaseSerializer


class ClaseService:

    @staticmethod
    def list_all():
        clases = Clase.objects.all()
        return ClaseSerializer(clases, many=True).data

    @staticmethod
    def retrieve(pk):
        try:
            clase = Clase.objects.get(pk=pk)
            return ClaseSerializer(clase).data
        except Clase.DoesNotExist:
            return None

    @staticmethod
    def create(data):
        serializer = ClaseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        try:
            clase = Clase.objects.get(pk=pk)
        except Clase.DoesNotExist:
            return None, None

        serializer = ClaseSerializer(clase, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return serializer.data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        try:
            clase = Clase.objects.get(pk=pk)
            clase.delete()
            return True
        except Clase.DoesNotExist:
            return False