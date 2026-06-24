from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    JornadaHoraViewSet,
    DistributivoViewSet,
    DistributivoAsignaturaViewSet,
    HorarioViewSet,
    PlanificacionCurricularViewSet,
    PlanificacionCurricularHistorialViewSet,
)

router = DefaultRouter()
router.register(r'jornadas', JornadaHoraViewSet, basename='jornada')
router.register(r'distributivos', DistributivoViewSet, basename='distributivo')
router.register(r'distributivos-asignaturas', DistributivoAsignaturaViewSet, basename='distributivo-asignatura')
router.register(r'horarios', HorarioViewSet, basename='horario')
router.register(r'planificaciones', PlanificacionCurricularViewSet, basename='planificacion')
router.register(r'planificaciones-historial', PlanificacionCurricularHistorialViewSet, basename='planificacion-historial')

app_name = 'distributivos'

urlpatterns = [
    path('', include(router.urls)),
]
