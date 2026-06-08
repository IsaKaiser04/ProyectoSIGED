from .educacion_serializer import EducacionNivelSerializer, EducacionSubNivelSerializer
from .plan_estudio_serializer import PlanEstudioSerializer, GradoSerializer, AsignaturaSerializer
from .anio_lectivo_serializer import AnioLectivoSerializer, PeriodoAcademicoSerializer
from .oferta_serializer import OfertaAcademicaSerializer, GradoOfertadoSerializer, AsignaturaOfertadaSerializer
from .paralelo_serializer import ParaleloSerializer
from .calificacion_serializer import CalificacionSerializer

__all__ = [
    'EducacionNivelSerializer',
    'EducacionSubNivelSerializer',
    'PlanEstudioSerializer',
    'GradoSerializer',
    'AsignaturaSerializer',
    'AnioLectivoSerializer',
    'PeriodoAcademicoSerializer',
    'OfertaAcademicaSerializer',
    'GradoOfertadoSerializer',
    'AsignaturaOfertadaSerializer',
    'ParaleloSerializer',
    'CalificacionSerializer',
]