from django.urls import path

from apps.calificaciones.views.evaluacion_categoria_view import EvaluacionCategoriaListCreateView, EvaluacionCategoriaDetailView
from apps.calificaciones.views.evaluacion_rubrica_view import EvaluacionRubricaListView, EvaluacionRubricaDetailView
from apps.calificaciones.views.evaluacion_equivalencia_view import EvaluacionEquivalenciaListView, EvaluacionEquivalenciaDetailView
from apps.calificaciones.views.evaluacion_criterio_view import EvaluacionCriterioListView, EvaluacionCriterioDetailView
from apps.calificaciones.views.evaluacion_libro_view import EvaluacionLibroListView, EvaluacionLibroDetailView
from apps.calificaciones.views.incidencia_view import IncidenciaListView, IncidenciaDetailView
from apps.calificaciones.views.calificacion_view import CalificacionListCreateView, CalificacionDetailView
from apps.calificaciones.views.calificacion_mejora_view import CalificacionMejoraListView, CalificacionMejoraDetailView
from apps.calificaciones.views.calificacion_historico_view import CalificacionHistoricoListView, CalificacionHistoricoDetailView
from apps.calificaciones.views.promedio_view import PromedioListView, PromedioDetailView
from apps.calificaciones.views.promedio_categoria_view import PromedioCategoriaListView, PromedioCategoriaDetailView
from apps.calificaciones.views.asignatura_evaluacion_view import AsignaturaEvaluacionListView, AsignaturaEvaluacionDetailView

urlpatterns = [

    #evaluacion categorias
    path('evaluacion-categorias/', EvaluacionCategoriaListCreateView.as_view(), name='evaluacion_categoria_list_create'),
    path('evaluacion-categorias/<int:pk>/', EvaluacionCategoriaDetailView.as_view(), name='evaluacion_categoria_detail'),

    #evaluacion rubrica
    path('evaluacion-rubrica/', EvaluacionRubricaListView.as_view(), name='evaluacion_rubrica_list_create'),
    path('evaluacion-rubrica/<int:pk>/', EvaluacionRubricaDetailView.as_view(), name='evaluacion_rubrica_detail'),

    #evaluacion equivalencia
    path('evaluacion-equivalencia/', EvaluacionEquivalenciaListView.as_view(), name='evaluacion_equivalencia_list_create'),
    path('evaluacion-equivalencia/<int:pk>/', EvaluacionEquivalenciaDetailView.as_view(), name='evaluacion_equivalencia_detail'),

    #evaluacion criterio
    path('evaluacion-criterio/', EvaluacionCriterioListView.as_view(), name='evaluacion_criterio_list_create'),
    path('evaluacion-criterio/<int:pk>/', EvaluacionCriterioDetailView.as_view(), name='evaluacion_criterio_detail'),

    #evaluacion libro
    path('evaluacion-libro/', EvaluacionLibroListView.as_view(), name='evaluacion_libro_list_create'),
    path('evaluacion-libro/<int:pk>/', EvaluacionLibroDetailView.as_view(), name='evaluacion_libro_detail'),

    # incidencias
    path('incidencias/', IncidenciaListView.as_view(), name='incidencia_list_create'),
    path('incidencias/<int:pk>/', IncidenciaDetailView.as_view(), name='incidencia_detail'),

    # calificaciones
    path('calificaciones/', CalificacionListCreateView.as_view(), name='calificacion_list_create'),
    path('calificaciones/<int:pk>/', CalificacionDetailView.as_view(), name='calificacion_detail'),

    # calificaciones mejora
    path('calificaciones-mejora/', CalificacionMejoraListView.as_view(), name='calificacion_mejora_list_create'),
    path('calificaciones-mejora/<int:pk>/', CalificacionMejoraDetailView.as_view(), name='calificacion_mejora_detail'),

    # calificaciones historico
    path('calificaciones-historico/', CalificacionHistoricoListView.as_view(), name='calificacion_historico_list_create'),
    path('calificaciones-historico/<int:pk>/', CalificacionHistoricoDetailView.as_view(), name='calificacion_historico_detail'),

    # promedios
    path('promedios/', PromedioListView.as_view(), name='promedio_list_create'),
    path('promedios/<int:pk>/', PromedioDetailView.as_view(), name='promedio_detail'),

    # promedios categorias
    path('promedios-categoria/', PromedioCategoriaListView.as_view(), name='promedio_categoria_list_create'),
    path('promedios-categoria/<int:pk>/', PromedioCategoriaDetailView.as_view(), name='promedio_categoria_detail'),

    # asignatura evaluacion
    path('asignatura-evaluacion/', AsignaturaEvaluacionListView.as_view(), name='asignatura_evaluacion_list_create'),
    path('asignatura-evaluacion/<int:pk>/', AsignaturaEvaluacionDetailView.as_view(), name='asignatura_evaluacion_detail'),

]

