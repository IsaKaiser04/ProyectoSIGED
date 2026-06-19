from django.contrib import admin
from apps.asistencia.models import Clase, Asistencia, Incidencia

for model in [Clase, Asistencia, Incidencia]:
    try:
        admin.site.unregister(model)
    except admin.sites.NotRegistered:
        pass


@admin.register(Clase)
class ClaseAdmin(admin.ModelAdmin):
    list_display = ('tema', 'fecha', 'hora_inicio', 'hora_fin', 'estado')
    list_filter = ('estado', 'fecha')
    search_fields = ('tema', 'descripcion')


@admin.register(Asistencia)
class AsistenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'clase', 'matricula', 'tipo', 'notificar')
    list_filter = ('tipo', 'notificar')
    search_fields = ('observacion',)


@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'asistencia', 'descripcion_corta')
    search_fields = ('descripcion',)

    def descripcion_corta(self, obj):
        return obj.descripcion[:50] + '...' if len(obj.descripcion) > 50 else obj.descripcion
    descripcion_corta.short_description = 'Descripcion'