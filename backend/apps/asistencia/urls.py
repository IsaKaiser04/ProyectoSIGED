from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.asistencia.views.asistencia_view import AsistenciaViewSet
from apps.asistencia.views.clase_view import ClaseViewSet
from apps.asistencia.views.incidencia_view import IncidenciaViewSet
from apps.asistencia.views.justificacion_view import JustificacionViewSet
from apps.asistencia.views.estadistica_view import (
    kpi_paralelo,
    tendencia_semanal,
    alumnos_riesgo,
    resumen_semanal_docente
)

router = DefaultRouter()
router.register(r'clases', ClaseViewSet, basename='clase')
router.register(r'asistencias', AsistenciaViewSet, basename='asistencia')
router.register(r'incidencias', IncidenciaViewSet, basename='incidencia')
router.register(r'justificaciones', JustificacionViewSet, basename='justificacion')

urlpatterns = [
    # Endpoints de ViewSets (CRUD + acciones personalizadas)
    path('', include(router.urls)),

    # Endpoints de Estadísticas / Dashboard
    path('estadisticas/kpi_paralelo/', kpi_paralelo, name='kpi_paralelo'),
    path('estadisticas/tendencia_semanal/', tendencia_semanal, name='tendencia_semanal'),
    path('estadisticas/alumnos_riesgo/', alumnos_riesgo, name='alumnos_riesgo'),
    path('estadisticas/resumen_semanal/', resumen_semanal_docente, name='resumen_semanal'),
]
