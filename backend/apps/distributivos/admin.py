from django.contrib import admin

from .models import (
    Distributivo,
    DistributivoAsignatura,
    Horario,
    JornadaHora,
    PlanificacionCurricular,
    PlanificacionCurricularHistorial,
)


@admin.register(Distributivo)
class DistributivoAdmin(admin.ModelAdmin):
    list_display = ('id', 'docente_referencia', 'anio_lectivo_referencia', 'created_at')
    search_fields = ('docente_referencia', 'anio_lectivo_referencia')
    list_filter = ('created_at',)


@admin.register(DistributivoAsignatura)
class DistributivoAsignaturaAdmin(admin.ModelAdmin):
    list_display = ('id', 'distributivo', 'asignatura_ofertada_referencia', 'created_at')
    search_fields = ('asignatura_ofertada_referencia',)
    list_filter = ('created_at',)


@admin.register(JornadaHora)
class JornadaHoraAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'hora_inicio', 'hora_fin', 'institucion_educativa_referencia')
    search_fields = ('nombre', 'institucion_educativa_referencia')


@admin.register(PlanificacionCurricular)
class PlanificacionCurricularAdmin(admin.ModelAdmin):
    list_display = ('id', 'distributivo_asignatura', 'estado', 'created_at')
    search_fields = ('estado',)
    list_filter = ('estado', 'created_at')


@admin.register(PlanificacionCurricularHistorial)
class PlanificacionCurricularHistorialAdmin(admin.ModelAdmin):
    list_display = ('id', 'planificacion_curricular', 'estado_anterior', 'estado_actual', 'fecha')
    search_fields = ('estado_anterior', 'estado_actual')
    list_filter = ('estado_anterior', 'estado_actual', 'fecha')


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'distributivo', 'distributivo_asignatura', 'dia_semana', 'hora_inicio', 'hora_fin', 'tipo_horario')
    search_fields = ('dia_semana', 'tipo_horario')
    list_filter = ('dia_semana', 'tipo_horario')