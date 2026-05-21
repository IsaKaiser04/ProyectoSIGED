from django.urls import path

from .views import (
    AnioLectivoDetailView,
    AnioLectivoListCreateView,
    AsignaturaDetailView,
    AsignaturaListCreateView,
    AsignaturaOfertadaDetailView,
    AsignaturaOfertadaListCreateView,
    CalificacionDetailView,
    CalificacionListCreateView,
    EducacionNivelDetailView,
    EducacionNivelListCreateView,
    EducacionSubNivelDetailView,
    EducacionSubNivelListCreateView,
    GradoDetailView,
    GradoListCreateView,
    GradoOfertadoDetailView,
    GradoOfertadoListCreateView,
    OfertaAcademicaDetailView,
    OfertaAcademicaListCreateView,
    ParaleloDetailView,
    ParaleloListCreateView,
    PeriodoAcademicoDetailView,
    PeriodoAcademicoListCreateView,
    PlanEstudioDetailView,
    PlanEstudioListCreateView,
)

urlpatterns = [
    # Catálogos de educación
    path('niveles/', EducacionNivelListCreateView.as_view()),
    path('niveles/<int:pk>/', EducacionNivelDetailView.as_view()),
    path('subniveles/', EducacionSubNivelListCreateView.as_view()),
    path('subniveles/<int:pk>/', EducacionSubNivelDetailView.as_view()),

    # Plan de estudio
    path('planes-estudio/', PlanEstudioListCreateView.as_view()),
    path('planes-estudio/<int:pk>/', PlanEstudioDetailView.as_view()),
    path('grados/', GradoListCreateView.as_view()),
    path('grados/<int:pk>/', GradoDetailView.as_view()),
    path('asignaturas/', AsignaturaListCreateView.as_view()),
    path('asignaturas/<int:pk>/', AsignaturaDetailView.as_view()),

    # Año lectivo y períodos
    path('anios-lectivos/', AnioLectivoListCreateView.as_view()),
    path('anios-lectivos/<int:pk>/', AnioLectivoDetailView.as_view()),
    path('periodos/', PeriodoAcademicoListCreateView.as_view()),
    path('periodos/<int:pk>/', PeriodoAcademicoDetailView.as_view()),

    # Oferta académica
    path('ofertas/', OfertaAcademicaListCreateView.as_view()),
    path('ofertas/<int:pk>/', OfertaAcademicaDetailView.as_view()),
    path('grados-ofertados/', GradoOfertadoListCreateView.as_view()),
    path('grados-ofertados/<int:pk>/', GradoOfertadoDetailView.as_view()),
    path('asignaturas-ofertadas/', AsignaturaOfertadaListCreateView.as_view()),
    path('asignaturas-ofertadas/<int:pk>/', AsignaturaOfertadaDetailView.as_view()),

    # Paralelos y calificaciones
    path('paralelos/', ParaleloListCreateView.as_view()),
    path('paralelos/<int:pk>/', ParaleloDetailView.as_view()),
    path('calificaciones/', CalificacionListCreateView.as_view()),
    path('calificaciones/<int:pk>/', CalificacionDetailView.as_view()),
]
