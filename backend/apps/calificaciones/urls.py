from django.urls import path

from apps.calificaciones.views.evaluacion_categoria_view import (
    EvaluacionCategoriaListCreateView, EvaluacionCategoriaDetailView,
)
from apps.calificaciones.views.evaluacion_rubrica_view import (
    EvaluacionRubricaListView, EvaluacionRubricaDetailView,
)
from apps.calificaciones.views.evaluacion_equivalencia_view import (
    EvaluacionEquivalenciaListView, EvaluacionEquivalenciaDetailView,
)
from apps.calificaciones.views.evaluacion_criterio_view import (
    EvaluacionCriterioListView, EvaluacionCriterioDetailView,
)
from apps.calificaciones.views.evaluacion_libro_view import (
    EvaluacionLibroListView, EvaluacionLibroDetailView,
)
from apps.calificaciones.views.asignatura_evaluacion_view import (
    AsignaturaEvaluacionListCreateView, AsignaturaEvaluacionDetailView,
)
from apps.calificaciones.views.calificacion_view import (
    CalificacionListCreateView, CalificacionDetailView,
    CalificacionHistoricoListView,
)
from apps.calificaciones.views.calificacion_mejora_view import (
    CalificacionMejoraListCreateView, CalificacionMejoraDetailView,
)
from apps.calificaciones.views.incidencia_view import (
    IncidenciaListCreateView, IncidenciaDetailView,
)
from apps.calificaciones.views.promedio_view import (
    PromedioListCreateView, PromedioDetailView,
    PromedioCategoriaListView,
)

urlpatterns = [
    path('evaluacion-categorias/', EvaluacionCategoriaListCreateView.as_view(), name='evaluacion_categoria_list_create'),
    path('evaluacion-categorias/<int:pk>/', EvaluacionCategoriaDetailView.as_view(), name='evaluacion_categoria_detail'),
    path('evaluacion-rubrica/', EvaluacionRubricaListView.as_view(), name='evaluacion_rubrica_list_create'),
    path('evaluacion-rubrica/<int:pk>/', EvaluacionRubricaDetailView.as_view(), name='evaluacion_rubrica_detail'),
    path('evaluacion-equivalencia/', EvaluacionEquivalenciaListView.as_view(), name='evaluacion_equivalencia_list_create'),
    path('evaluacion-equivalencia/<int:pk>/', EvaluacionEquivalenciaDetailView.as_view(), name='evaluacion_equivalencia_detail'),
    path('evaluacion-criterio/', EvaluacionCriterioListView.as_view(), name='evaluacion_criterio_list_create'),
    path('evaluacion-criterio/<int:pk>/', EvaluacionCriterioDetailView.as_view(), name='evaluacion_criterio_detail'),
    path('evaluacion-libro/', EvaluacionLibroListView.as_view(), name='evaluacion_libro_list_create'),
    path('evaluacion-libro/<int:pk>/', EvaluacionLibroDetailView.as_view(), name='evaluacion_libro_detail'),
    path('asignatura-evaluacion/', AsignaturaEvaluacionListCreateView.as_view(), name='asignatura_evaluacion_list_create'),
    path('asignatura-evaluacion/<int:pk>/', AsignaturaEvaluacionDetailView.as_view(), name='asignatura_evaluacion_detail'),
    path('calificaciones/', CalificacionListCreateView.as_view(), name='calificacion_list_create'),
    path('calificaciones/<int:pk>/', CalificacionDetailView.as_view(), name='calificacion_detail'),
    path('calificaciones/<int:calificacion_pk>/historicos/', CalificacionHistoricoListView.as_view(), name='calificacion_historico_list'),
    path('calificaciones/<int:calificacion_pk>/mejoras/', CalificacionMejoraListCreateView.as_view(), name='calificacion_mejora_list_create'),
    path('calificaciones/<int:calificacion_pk>/mejoras/<int:pk>/', CalificacionMejoraDetailView.as_view(), name='calificacion_mejora_detail'),
    path('incidencias/', IncidenciaListCreateView.as_view(), name='incidencia_list_create'),
    path('incidencias/<int:pk>/', IncidenciaDetailView.as_view(), name='incidencia_detail'),
    path('promedios/', PromedioListCreateView.as_view(), name='promedio_list_create'),
    path('promedios/<int:pk>/', PromedioDetailView.as_view(), name='promedio_detail'),
    path('promedios/<int:promedio_pk>/categorias/', PromedioCategoriaListView.as_view(), name='promedio_categoria_list'),
]
