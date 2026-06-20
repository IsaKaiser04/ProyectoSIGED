from django.contrib import admin
from apps.asistencia.models import Clase, Asistencia, Incidencia, Justificacion


@admin.register(Clase)
class ClaseAdmin(admin.ModelAdmin):
    list_display = ('id', 'tema', 'fecha', 'hora_inicio', 'hora_fin', 'estado', 'distributivo_asignatura_id')
    list_filter = ('estado', 'fecha')
    search_fields = ('tema', 'descripcion')
    date_hierarchy = 'fecha'


@admin.register(Asistencia)
class AsistenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'clase', 'matricula_id', 'tipo', 'notificar', 'registrado_por', 'fecha_registro')
    list_filter = ('tipo', 'notificar', 'clase__fecha')
    search_fields = ('observacion',)
    date_hierarchy = 'fecha_registro'


@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'asunto', 'tipo', 'estado', 'notificar', 'registrado_por', 'fecha_registro')
    list_filter = ('tipo', 'estado', 'notificar')
    search_fields = ('asunto', 'detalle')


@admin.register(Justificacion)
class JustificacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado', 'asistencia', 'solicitado_por', 'resuelto_por', 'fecha_solicitud', 'fecha_resolucion')
    list_filter = ('estado', 'fecha_solicitud')
    search_fields = ('motivo', 'observacion_secretaria')
