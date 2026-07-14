from django.contrib import admin
from apps.matricula.models import MatriculaRequisito, MatriculaPeriodo, Matricula, Requisito, Retiro


@admin.register(MatriculaRequisito)
class MatriculaRequisitoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tipo', 'es_obligatorio')
    list_filter = ('tipo', 'es_obligatorio')
    search_fields = ('nombre', 'descripcion')


@admin.register(MatriculaPeriodo)
class MatriculaPeriodoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'tipo', 'fecha_inicio', 'fecha_fin', 'anio_lectivo_id')
    list_filter = ('tipo', 'anio_lectivo')


@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ('id', 'codigo_unico', 'estado', 'estudiante_id', 'paralelo_id', 'fecha_registro')
    list_filter = ('estado', 'tiene_discapacidad')
    search_fields = ('codigo_unico', 'estudiante__nombres', 'estudiante__identificacion')
    date_hierarchy = 'fecha_registro'


@admin.register(Requisito)
class RequisitoAdmin(admin.ModelAdmin):
    list_display = ('id', 'matricula', 'matricula_requisito', 'estado', 'revisado_por', 'fecha_revision')
    list_filter = ('estado',)
    search_fields = ('observacion',)


@admin.register(Retiro)
class RetiroAdmin(admin.ModelAdmin):
    list_display = ('id', 'matricula', 'fecha', 'motivo')
    date_hierarchy = 'fecha'
