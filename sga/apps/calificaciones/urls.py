from django.urls import path

from apps.calificaciones.views.evaluacion_categoria_view import EvaluacionCategoriaListCreateView, EvaluacionCategoriaDetailView
from apps.calificaciones.views.evaluacion_rubrica_view import EvaluacionRubricaListView, EvaluacionRubricaDetailView
from apps.calificaciones.views.evaluacion_equivalencia_view import EvaluacionEquivalenciaListView, EvaluacionEquivalenciaDetailView
from apps.calificaciones.views.evaluacion_criterio_view import EvaluacionCriterioListView, EvaluacionCriterioDetailView

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

]

