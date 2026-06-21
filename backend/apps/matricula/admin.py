from django.contrib import admin
from apps.asistencia.models import Clase, Asistencia, Incidencia

admin.site.register(Clase)
admin.site.register(Asistencia)
admin.site.register(Incidencia)