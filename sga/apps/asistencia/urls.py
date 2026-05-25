from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.asistencia.views.clase_view import ClaseViewSet
from apps.asistencia.views.asistencia_view import AsistenciaViewSet
from apps.asistencia.views.incidencia_view import IncidenciaViewSet

router = DefaultRouter()
router.register(r'clases', ClaseViewSet, basename='clase')
router.register(r'asistencias', AsistenciaViewSet, basename='asistencia')
router.register(r'incidencias', IncidenciaViewSet, basename='incidencia')

urlpatterns = [
    path('', include(router.urls)),
]