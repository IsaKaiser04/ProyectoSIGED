from django.urls import path

from apps.calificaciones.views.evaluacion_categoria_view import EvaluacionCategoriaListCreateView, EvaluacionCategoriaDetailView


urlpatterns = [

    #evaluacion categorias
    path('evaluacion-categorias/', EvaluacionCategoriaListCreateView.as_view(), name='evaluacion_categoria_list_create'),
    path('evaluacion-categorias/<int:pk>/', EvaluacionCategoriaDetailView.as_view(), name='evaluacion_categoria_detail'),

]

