# ViewSets nuevos (Patrón correcto)
from .anio_lectivo_view import AnioLectivoViewSet
from .paralelo_view import ParaleloViewSet

# Vistas antiguas (Las que no hemos tocado todavía)
from .plan_estudio_view import PlanEstudioListCreateView, PlanEstudioDetailView, GradoListCreateView, GradoDetailView, AsignaturaListCreateView, AsignaturaDetailView
from .oferta_view import OfertaAcademicaListCreateView, OfertaAcademicaDetailView, GradoOfertadoListCreateView, GradoOfertadoDetailView, AsignaturaOfertadaListCreateView, AsignaturaOfertadaDetailView
from .calificacion_view import CalificacionListCreateView, CalificacionDetailView
