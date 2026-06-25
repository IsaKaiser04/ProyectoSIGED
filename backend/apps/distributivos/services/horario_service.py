from ..repositories import HorarioRepository
from ..serializers.horario_serializer import (
    HorarioListSerializer,
    HorarioDetailSerializer,
    HorarioCreateSerializer,
)
from ..serializers.horario_serializer import (
    HorarioDocenteSerializer,
    HorarioParaleloSerializer,
)


class HorarioService:
    @staticmethod
    def list_all():
        instances = HorarioRepository.get_all()
        return HorarioListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return None
        return HorarioDetailSerializer(instance).data

    @staticmethod
    def create(data):
        serializer = HorarioCreateSerializer(data=data)
        if serializer.is_valid():
            instance = HorarioRepository.create(serializer.validated_data)
            return HorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return None, {"error": "Horario no encontrado"}
        serializer = HorarioCreateSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            instance = HorarioRepository.update(instance, serializer.validated_data)
            return HorarioDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        instance = HorarioRepository.get_by_id(pk)
        if not instance:
            return False, {"error": "Horario no encontrado"}
        HorarioRepository.delete(pk)
        return True, None

    @staticmethod
    def por_distributivo(distributivo_id):
        instances = HorarioRepository.filter_by_distributivo(distributivo_id)
        return HorarioListSerializer(instances, many=True).data

    @staticmethod
    def por_distributivo_asignatura(distributivo_asignatura_id):
        instances = HorarioRepository.filter_by_distributivo_asignatura(distributivo_asignatura_id)
        return HorarioListSerializer(instances, many=True).data

    @staticmethod
    def por_paralelo(paralelo_id):
        instances = HorarioRepository.filter_by_paralelo(paralelo_id)
        return HorarioParaleloSerializer(instances, many=True).data

    @staticmethod
    def por_docente_actual(cuenta_id):
        instances = HorarioRepository.filter_by_docente_cuenta(cuenta_id)
        return HorarioDocenteSerializer(instances, many=True).data

    @staticmethod
    def todos_paralelos():
        """Devuelve horarios agrupados por paralelo"""
        from collections import OrderedDict

        instances = HorarioRepository.get_all()
        grupos = OrderedDict()
        for h in instances:
            da = h.distributivo_asignatura
            paralelo = da.paralelo
            key = paralelo.id
            if key not in grupos:
                grupos[key] = {
                    'paralelo_id': paralelo.id,
                    'paralelo_nombre': paralelo.nombre,
                    'grado': paralelo.gradoOfertado.nombre if hasattr(paralelo, 'gradoOfertado') and paralelo.gradoOfertado else '',
                    'horarios': [],
                }
            grupos[key]['horarios'].append(HorarioParaleloSerializer(h).data)
        return list(grupos.values())
