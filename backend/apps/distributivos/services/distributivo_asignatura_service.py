from ..repositories import DistributivoAsignaturaRepository
from ..serializers.distributivo_asignatura_serializer import (
    DistributivoAsignaturaListSerializer,
    DistributivoAsignaturaDetailSerializer,
    DistributivoAsignaturaCreateSerializer,
)
from ..serializers.distributivo_asignatura_pca_serializer import (
    DistributivoAsignaturaConPcaSerializer,
)


class DistributivoAsignaturaService:
    @staticmethod
    def list_all():
        instances = DistributivoAsignaturaRepository.get_all()
        return DistributivoAsignaturaListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = DistributivoAsignaturaRepository.get_by_id(pk)
        if not instance:
            return None
        return DistributivoAsignaturaDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = DistributivoAsignaturaCreateSerializer(data=data)
        if serializer.is_valid():
            instance = DistributivoAsignaturaRepository.create(serializer.validated_data)
            return DistributivoAsignaturaDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = DistributivoAsignaturaRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Asignatura de distributivo no encontrada"}
        serializer = DistributivoAsignaturaCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = DistributivoAsignaturaRepository.update(instance, serializer.validated_data)
            return DistributivoAsignaturaDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = DistributivoAsignaturaRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Asignatura de distributivo no encontrada"}
        DistributivoAsignaturaRepository.delete(pk)
        return True, None

    @staticmethod
    def por_distributivo(distributivo_id):
        instances = DistributivoAsignaturaRepository.filter_by_distributivo(distributivo_id)
        return DistributivoAsignaturaListSerializer(instances, many=True).data

    @staticmethod
    def por_docente_actual(request):
        cuenta_id = request.user.id
        instances = DistributivoAsignaturaRepository.filter_by_docente_cuenta(cuenta_id)
        return DistributivoAsignaturaConPcaSerializer(
            instances, many=True, context={'request': request}
        ).data
