from .educacion_view import EducacionNivelListCreateView, EducacionNivelDetailView
from .educacion_view import EducacionSubNivelListCreateView, EducacionSubNivelDetailView
from .plan_estudio_view import PlanEstudioListCreateView, PlanEstudioDetailView
from .plan_estudio_view import GradoListCreateView, GradoDetailView
from .plan_estudio_view import AsignaturaListCreateView, AsignaturaDetailView
from .anio_lectivo_view import AnioLectivoListCreateView, AnioLectivoDetailView
from .anio_lectivo_view import PeriodoAcademicoListCreateView, PeriodoAcademicoDetailView
from .oferta_view import OfertaAcademicaListCreateView, OfertaAcademicaDetailView
from .oferta_view import GradoOfertadoListCreateView, GradoOfertadoDetailView
from .oferta_view import AsignaturaOfertadaListCreateView, AsignaturaOfertadaDetailView
from .paralelo_view import ParaleloListCreateView, ParaleloDetailView

__all__ = [
    'EducacionNivelListCreateView', 'EducacionNivelDetailView',
    'EducacionSubNivelListCreateView', 'EducacionSubNivelDetailView',
    'PlanEstudioListCreateView', 'PlanEstudioDetailView',
    'GradoListCreateView', 'GradoDetailView',
    'AsignaturaListCreateView', 'AsignaturaDetailView',
    'AnioLectivoListCreateView', 'AnioLectivoDetailView',
    'PeriodoAcademicoListCreateView', 'PeriodoAcademicoDetailView',
    'OfertaAcademicaListCreateView', 'OfertaAcademicaDetailView',
    'GradoOfertadoListCreateView', 'GradoOfertadoDetailView',
    'AsignaturaOfertadaListCreateView', 'AsignaturaOfertadaDetailView',
    'ParaleloListCreateView', 'ParaleloDetailView',
    #CalificacionDetailView
]