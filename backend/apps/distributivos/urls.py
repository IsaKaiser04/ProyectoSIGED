from django.urls import path

from .views import (
    DistributivoAsignaturaDetailView,
    DistributivoAsignaturaListCreateView,
    DistributivoDetailView,
    DistributivoListCreateView,
    HorarioDetailView,
    HorarioListCreateView,
    JornadaHoraDetailView,
    JornadaHoraListCreateView,
    PlanificacionCurricularDetailView,
    PlanificacionCurricularHistorialDetailView,
    PlanificacionCurricularHistorialListCreateView,
    PlanificacionCurricularListCreateView,
)

app_name = 'distributivos'

urlpatterns = [
    path('distributivos/', DistributivoListCreateView.as_view(), name='distributivo-list-create'),
    path('distributivos/<int:pk>/', DistributivoDetailView.as_view(), name='distributivo-detail'),
    path('distributivos-asignaturas/', DistributivoAsignaturaListCreateView.as_view(), name='distributivo-asignatura-list-create'),
    path('distributivos-asignaturas/<int:pk>/', DistributivoAsignaturaDetailView.as_view(), name='distributivo-asignatura-detail'),
    path('horarios/', HorarioListCreateView.as_view(), name='horario-list-create'),
    path('horarios/<int:pk>/', HorarioDetailView.as_view(), name='horario-detail'),
    path('jornadas/', JornadaHoraListCreateView.as_view(), name='jornada-list-create'),
    path('jornadas/<int:pk>/', JornadaHoraDetailView.as_view(), name='jornada-detail'),
    path('planificaciones/', PlanificacionCurricularListCreateView.as_view(), name='planificacion-list-create'),
    path('planificaciones/<int:pk>/', PlanificacionCurricularDetailView.as_view(), name='planificacion-detail'),
    path('planificaciones-historial/', PlanificacionCurricularHistorialListCreateView.as_view(), name='planificacion-historial-list-create'),
    path('planificaciones-historial/<int:pk>/', PlanificacionCurricularHistorialDetailView.as_view(), name='planificacion-historial-detail'),
]