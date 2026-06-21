from django.urls import path

from apps.institucion.views.institucion_view import (
    InstitucionListCreateView,
    InstitucionDetailView
)

urlpatterns = [

    # LISTAR y CREAR
    path(
        'instituciones/',
        InstitucionListCreateView.as_view(),
        name='institucion-list-create'
    ),

    # OBTENER, ACTUALIZAR y ELIMINAR por ID
    path(
        'instituciones/<int:pk>/',
        InstitucionDetailView.as_view(),
        name='institucion-detail'
    ),

]