from django.urls import path
from .views import (
    EducacionNivelDetailView, EducacionNivelListCreateView,
    EducacionSubNivelDetailView, EducacionSubNivelListCreateView,
    PlanEstudioDetailView, PlanEstudioListCreateView,
    GradoDetailView, GradoListCreateView,
    AsignaturaDetailView, AsignaturaListCreateView,
    AnioLectivoDetailView, AnioLectivoListCreateView,
    PeriodoAcademicoDetailView, PeriodoAcademicoListCreateView,
    OfertaAcademicaDetailView, OfertaAcademicaListCreateView,
    GradoOfertadoDetailView, GradoOfertadoListCreateView,
    AsignaturaOfertadaDetailView, AsignaturaOfertadaListCreateView,
    ParaleloDetailView, ParaleloListCreateView,
)

urlpatterns = [
    path('niveles/', EducacionNivelListCreateView.as_view(), name='educacionnivel-list-create'),
    path('niveles/<int:pk>/', EducacionNivelDetailView.as_view(), name='educacionnivel-detail'),
    path('subniveles/', EducacionSubNivelListCreateView.as_view(), name='educacionsubnivel-list-create'),
    path('subniveles/<int:pk>/', EducacionSubNivelDetailView.as_view(), name='educacionsubnivel-detail'),

    path('planes-estudio/', PlanEstudioListCreateView.as_view(), name='planestudio-list-create'),
    path('planes-estudio/<int:pk>/', PlanEstudioDetailView.as_view(), name='planestudio-detail'),
    path('grados/', GradoListCreateView.as_view(), name='grado-list-create'),
    path('grados/<int:pk>/', GradoDetailView.as_view(), name='grado-detail'),
    path('asignaturas/', AsignaturaListCreateView.as_view(), name='asignatura-list-create'),
    path('asignaturas/<int:pk>/', AsignaturaDetailView.as_view(), name='asignatura-detail'),

    path('anios-lectivos/', AnioLectivoListCreateView.as_view(), name='aniolectivo-list-create'),
    path('anios-lectivos/<int:pk>/', AnioLectivoDetailView.as_view(), name='aniolectivo-detail'),
    path('periodos/', PeriodoAcademicoListCreateView.as_view(), name='periodoacademico-list-create'),
    path('periodos/<int:pk>/', PeriodoAcademicoDetailView.as_view(), name='periodoacademico-detail'),

    path('ofertas/', OfertaAcademicaListCreateView.as_view(), name='ofertaacademica-list-create'),
    path('ofertas/<int:pk>/', OfertaAcademicaDetailView.as_view(), name='ofertaacademica-detail'),
    path('grados-ofertados/', GradoOfertadoListCreateView.as_view(), name='gradoofertado-list-create'),
    path('grados-ofertados/<int:pk>/', GradoOfertadoDetailView.as_view(), name='gradoofertado-detail'),
    path('asignaturas-ofertadas/', AsignaturaOfertadaListCreateView.as_view(), name='asignaturaofertada-list-create'),
    path('asignaturas-ofertadas/<int:pk>/', AsignaturaOfertadaDetailView.as_view(), name='asignaturaofertada-detail'),

    path('paralelos/', ParaleloListCreateView.as_view(), name='paralelo-list-create'),
    path('paralelos/<int:pk>/', ParaleloDetailView.as_view(), name='paralelo-detail'),
]