from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importaciones nuevas (Patrón ViewSet)
from .views.anio_lectivo_view import AnioLectivoViewSet
from .views.paralelo_view import ParaleloViewSet

# Importaciones antiguas (Las que no hemos tocado aún)
from .views.educacion_view import EducacionNivelListCreateView, EducacionNivelDetailView, EducacionSubNivelListCreateView, EducacionSubNivelDetailView
from .views.plan_estudio_view import PlanEstudioListCreateView, PlanEstudioDetailView, GradoListCreateView, GradoDetailView, AsignaturaListCreateView, AsignaturaDetailView, grados_periodos_info, grado_periodos_detail
from .views.calificacion_view import CalificacionListCreateView, CalificacionDetailView
from .views.oferta_view import OfertaAcademicaListCreateView, OfertaAcademicaDetailView, GradoOfertadoListCreateView, GradoOfertadoDetailView, AsignaturaOfertadaListCreateView, AsignaturaOfertadaDetailView, preview_asignaturas, crear_grado_con_asignaturas

router = DefaultRouter()
router.register(r'anios-lectivos', AnioLectivoViewSet, basename='anio-lectivo')
router.register(r'paralelos', ParaleloViewSet, basename='paralelo')

urlpatterns = [
    # Rutas nuevas con patrón correcto
    path('', include(router.urls)),
    
    # Rutas antiguas (Mantenidas por compatibilidad temporal con otros módulos)
    path('niveles/', EducacionNivelListCreateView.as_view(), name='educacionnivel-list-create'),
    path('niveles/<int:pk>/', EducacionNivelDetailView.as_view(), name='educacionnivel-detail'),
    path('subniveles/', EducacionSubNivelListCreateView.as_view(), name='educacionsubnivel-list-create'),
    path('subniveles/<int:pk>/', EducacionSubNivelDetailView.as_view(), name='educacionsubnivel-detail'),
    path('planes-estudio/', PlanEstudioListCreateView.as_view(), name='planestudio-list-create'),
    path('planes-estudio/<int:pk>/', PlanEstudioDetailView.as_view(), name='planestudio-detail'),
    path('grados/', GradoListCreateView.as_view(), name='grado-list-create'),
    path('grados/periodos-info/', grados_periodos_info, name='grados-periodos-info'),
    path('grados/<int:pk>/', GradoDetailView.as_view(), name='grado-detail'),
    path('grados/<int:pk>/periodos-info/', grado_periodos_detail, name='grado-periodos-detail'),
    path('asignaturas/', AsignaturaListCreateView.as_view(), name='asignatura-list-create'),
    path('asignaturas/<int:pk>/', AsignaturaDetailView.as_view(), name='asignatura-detail'),
    path('calificaciones/', CalificacionListCreateView.as_view(), name='calificacion-list-create'),
    path('calificaciones/<int:pk>/', CalificacionDetailView.as_view(), name='calificacion-detail'),
    path('oferta/', OfertaAcademicaListCreateView.as_view(), name='oferta-list-create'),
    path('oferta/<int:pk>/', OfertaAcademicaDetailView.as_view(), name='oferta-detail'),
    path('grados-ofertados/', GradoOfertadoListCreateView.as_view(), name='gradoofertado-list-create'),
    path('grados-ofertados/<int:pk>/', GradoOfertadoDetailView.as_view(), name='gradoofertado-detail'),
    path('asignaturas-ofertadas/', AsignaturaOfertadaListCreateView.as_view(), name='asignaturaofertada-list-create'),
    path('asignaturas-ofertadas/<int:pk>/', AsignaturaOfertadaDetailView.as_view(), name='asignaturaofertada-detail'),
    path('preview-asignaturas/', preview_asignaturas, name='preview-asignaturas'),
    path('grados-ofertados/crear-con-asignaturas/', crear_grado_con_asignaturas, name='gradoofertado-crear-con-asignaturas'),
]
