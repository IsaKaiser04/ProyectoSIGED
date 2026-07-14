from django.urls import path

from .views import (
    AdaptacionCurricularDetailView,
    AdaptacionCurricularEvidenciaDetailView,
    AdaptacionCurricularEvidenciaListCreateView,
    AdaptacionCurricularListCreateView,
    AdaptacionCurricularPlanificacionDetailView,
    AdaptacionCurricularPlanificacionListCreateView,
)

app_name = 'dece'

urlpatterns = [
    path('adaptaciones-curriculares/', AdaptacionCurricularListCreateView.as_view(), name='adaptacion-curricular-list-create'),
    path('adaptaciones-curriculares/<int:pk>/', AdaptacionCurricularDetailView.as_view(), name='adaptacion-curricular-detail'),
    path('adaptaciones-evidencias/', AdaptacionCurricularEvidenciaListCreateView.as_view(), name='adaptacion-evidencia-list-create'),
    path('adaptaciones-evidencias/<int:pk>/', AdaptacionCurricularEvidenciaDetailView.as_view(), name='adaptacion-evidencia-detail'),
    path('adaptaciones-planificaciones/', AdaptacionCurricularPlanificacionListCreateView.as_view(), name='adaptacion-planificacion-list-create'),
    path('adaptaciones-planificaciones/<int:pk>/', AdaptacionCurricularPlanificacionDetailView.as_view(), name='adaptacion-planificacion-detail'),
]