"""
URL configuration for sga project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
""" La función de este archivo es definir las rutas URL para el proyecto Django, 
incluyendo la ruta para el panel de administración de Django y las rutas
 específicas de la aplicación de actores académicos. 
 """
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/actoresAcademicos/',include('apps.actoresAcademicos.urls')),
    path('api/ubicacion/', include('apps.ubicacion.urls')),
    path('api/institucion/', include('apps.institucion.urls')), 
]
