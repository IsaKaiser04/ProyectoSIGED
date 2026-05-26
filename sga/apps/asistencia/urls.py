from django.urls import path
from apps.asistencia.views.clase_view import ClaseViewSet
from apps.asistencia.views.asistencia_view import AsistenciaViewSet
from apps.asistencia.views.incidencia_view import IncidenciaViewSet

urlpatterns = [
    # Clases
    path('clases/', ClaseViewSet.as_view({'get': 'list', 'post': 'create'}), name='clase-list-create'),
    path('clases/<int:pk>/', ClaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='clase-detail'),

    # Asistencias
    path('asistencias/', AsistenciaViewSet.as_view({'get': 'list', 'post': 'create'}), name='asistencia-list-create'),
    path('asistencias/<int:pk>/', AsistenciaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='asistencia-detail'),

    # Incidencias
    path('incidencias/', IncidenciaViewSet.as_view({'get': 'list', 'post': 'create'}), name='incidencia-list-create'),
    path('incidencias/<int:pk>/', IncidenciaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='incidencia-detail'),
    path('incidencias/por_asistencia/', IncidenciaViewSet.as_view({'get': 'por_asistencia'}), name='incidencia-por-asistencia'),
]