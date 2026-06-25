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
    def todos_paralelos(anio_lectivo_id=None):
        """Devuelve horarios agrupados por paralelo, opcionalmente filtrados por año lectivo"""
        from collections import OrderedDict

        instances = HorarioRepository.get_all()
        grupos = OrderedDict()
        for h in instances:
            da = h.distributivo_asignatura
            if da is None:
                continue
            if anio_lectivo_id and h.distributivo and h.distributivo.anio_lectivo_id != anio_lectivo_id:
                continue
            paralelo = da.paralelo
            if paralelo is None:
                continue
            key = paralelo.id
            if key not in grupos:
                grado_ofertado = getattr(paralelo, 'gradoOfertado', None)
                grado_obj = grado_ofertado.grado if grado_ofertado and hasattr(grado_ofertado, 'grado') else None
                go_nombre = grado_ofertado.nombre if grado_ofertado else ''
                g_nombre = grado_obj.nombre if grado_obj else ''
                grupos[key] = {
                    'paralelo_id': paralelo.id,
                    'paralelo_nombre': paralelo.nombre,
                    'grado': go_nombre,
                    'grado_id': grado_obj.id if grado_obj else None,
                    'grado_nombre': g_nombre or go_nombre,
                    'titulo': f"{g_nombre or go_nombre} - {paralelo.nombre}",
                    'horarios': [],
                }
            grupos[key]['horarios'].append(HorarioParaleloSerializer(h).data)
        return list(grupos.values())
