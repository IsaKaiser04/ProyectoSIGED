from django.contrib import admin
from apps.matricula.models import (
    MatriculaPeriodo, Matricula, MatriculaRequisito, Requisito, Retiro
)

for model in [MatriculaPeriodo, Matricula, MatriculaRequisito, Requisito, Retiro]:
    try:
        admin.site.unregister(model)
    except admin.sites.NotRegistered:
        pass


@admin.register(MatriculaPeriodo)
class MatriculaPeriodoAdmin(admin.ModelAdmin):
    list_display = ('tipo', 'fecha_inicio', 'fecha_fin')
    list_filter = ('tipo', 'fecha_inicio')
    search_fields = ('tipo',)


@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ('id', 'estado', 'fecha_registro', 'promedio_anual', 'matricula_periodo')
    list_filter = ('estado', 'fecha_registro')
    search_fields = ('id',)


@admin.register(MatriculaRequisito)
class MatriculaRequisitoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'descripcion')  # ? Quitado institucion_id
    list_filter = ('tipo',)
    search_fields = ('nombre', 'descripcion')


@admin.register(Requisito)
class RequisitoAdmin(admin.ModelAdmin):
    list_display = ('id', 'matricula', 'matricula_requisito', 'estado', 'observacion')
    list_filter = ('estado', 'matricula_requisito')
    search_fields = ('observacion',)


@admin.register(Retiro)
class RetiroAdmin(admin.ModelAdmin):
    list_display = ('id', 'matricula', 'fecha', 'motivo_corto')
    list_filter = ('fecha',)
    search_fields = ('motivo',)

    def motivo_corto(self, obj):
        return obj.motivo[:50] + '...' if len(obj.motivo) > 50 else obj.motivo
    motivo_corto.short_description = 'Motivo'