from django.contrib import admin

from .models import (
    AdaptacionCurricular,
    AdaptacionCurricularEvidencia,
    AdaptacionCurricularPlanificacion,
)


@admin.register(AdaptacionCurricular)
class AdaptacionCurricularAdmin(admin.ModelAdmin):
    list_display = ('id', 'matricula', 'discapacidad_tipo', 'discapacidad_grado', 'necesidad_educativa', 'created_at')
    search_fields = ('matricula__estado', 'necesidad_educativa')
    list_filter = ('discapacidad_tipo', 'discapacidad_grado', 'created_at')


@admin.register(AdaptacionCurricularEvidencia)
class AdaptacionCurricularEvidenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'adaptacion_curricular', 'descripcion', 'created_at')
    search_fields = ('descripcion',)
    list_filter = ('created_at',)


@admin.register(AdaptacionCurricularPlanificacion)
class AdaptacionCurricularPlanificacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'adaptacion_curricular', 'distributivo_asignatura', 'estado', 'created_at')
    search_fields = ('comentario', 'distributivo_asignatura__asignatura_ofertada__nombre')
    list_filter = ('estado', 'created_at')
