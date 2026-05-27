from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/actoresAcademicos/', include('apps.actoresAcademicos.urls')),
    # TODO: Descomentar cuando el companero suba sus apps
    # path('api/ubicacion/', include('apps.ubicacion.urls')),
    # path('api/institucion/', include('apps.institucion.urls')),
    path('api/v1/matricula/', include('apps.matricula.urls')),
    path('api/v1/asistencia/', include('apps.asistencia.urls')),
]