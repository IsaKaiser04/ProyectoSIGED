from django.urls import path

from apps.actoresAcademicos.views import UsuarioCreateView


urlpatterns = [

    path(
        'usuarios/',
        UsuarioCreateView.as_view(),
        name='crear_usuario'
    ),

]