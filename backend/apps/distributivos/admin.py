from django.contrib import admin

from .models import (
    BloqueHorario,
    Distributivo,
    DistributivoAsignatura,
    Horario,
    JornadaHora,
    PlanificacionCurricular,
    PlanificacionCurricularHistorial,
)


@admin.register(Distributivo)
class DistributivoAdmin(admin.ModelAdmin):
    list_display = ('id', 'docente', 'anio_lectivo', 'created_at')
    search_fields = ('docente__nombres', 'docente__apellidos', 'anio_lectivo__nombre')
    list_filter = ('created_at',)


@admin.register(DistributivoAsignatura)
class DistributivoAsignaturaAdmin(admin.ModelAdmin):
    list_display = ('id', 'distributivo', 'asignatura_ofertada', 'created_at')
    search_fields = ('asignatura_ofertada__nombre',)
    list_filter = ('created_at',)


@admin.register(JornadaHora)
class JornadaHoraAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'hora_inicio', 'hora_fin', 'institucion')
    search_fields = ('nombre', 'institucion__nombre')


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


@admin.register(BloqueHorario)
class BloqueHorarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'paralelo', 'dia_semana', 'hora_inicio', 'hora_fin', 'orden')
    search_fields = ('paralelo__nombre', 'dia_semana')
    list_filter = ('dia_semana',)


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'distributivo', 'distributivo_asignatura', 'bloque_horario', 'dia_semana', 'hora_inicio', 'hora_fin', 'tipo_horario')
    search_fields = ('dia_semana', 'tipo_horario')
    list_filter = ('dia_semana', 'tipo_horario')
