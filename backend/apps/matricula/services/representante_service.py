from apps.matricula.repositories.matricula_requisito_repository import MatriculaRequisitoRepository
from apps.matricula.serializers.representante_serializer import RepresentanteSerializer


class RepresentanteService:
    @staticmethod
    def list_all():
        from apps.matricula.models import Representante
        return RepresentanteSerializer(Representante.objects.all(), many=True).data

    @staticmethod
    def retrieve(pk):
        from apps.matricula.models import Representante
        rep = Representante.objects.filter(pk=pk).first()
        return RepresentanteSerializer(rep).data if rep else None

    @staticmethod
    def create(data):
        serializer = RepresentanteSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            return RepresentanteSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        from apps.matricula.models import Representante
        rep = Representante.objects.filter(pk=pk).first()
        if not rep:
            return None
        serializer = RepresentanteSerializer(rep, data=data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()
            return RepresentanteSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        from apps.matricula.models import Representante
        rep = Representante.objects.filter(pk=pk).first()
        if not rep:
            return False
        rep.delete()
        return True
