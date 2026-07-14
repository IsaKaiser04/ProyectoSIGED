from django.contrib import admin

from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.evaluacionRubrica import EvaluacionRubrica
from apps.calificaciones.models.evaluacionEquivalencia import EvaluacionEquivalencia
from apps.calificaciones.models.evaluacionCriterio import EvaluacionCriterio
from apps.calificaciones.models.evaluacionLibro import EvaluacionLibro
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.models.calificacionMejora import CalificacionMejora
from apps.calificaciones.models.Incidencia import Incidencia
from apps.calificaciones.models.promedio import Promedio
from apps.calificaciones.models.promedioCategoria import PromedioCategoria


@admin.register(EvaluacionCategoria)
class EvaluacionCategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'nota_minima', 'nota_maxima', 'tipo_calculo']


@admin.register(EvaluacionRubrica)
class EvaluacionRubricaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'esActivo', 'evaluacion_tipo']


@admin.register(EvaluacionEquivalencia)
class EvaluacionEquivalenciaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'evaluacion_rubrica']


@admin.register(EvaluacionCriterio)
class EvaluacionCriterioAdmin(admin.ModelAdmin):
    list_display = ['cualitativa', 'cuantitativaMinima', 'cuantitativaMaxima', 'evaluacion_rubrica']


@admin.register(EvaluacionLibro)
class EvaluacionLibroAdmin(admin.ModelAdmin):
    list_display = ['nombre']


@admin.register(AsignaturaEvaluacion)
class AsignaturaEvaluacionAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'distributivo_asignatura', 'periodo_academico', 'activo']


@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ['valor', 'asignatura_evaluacion', 'matricula', 'fecha_registro']


@admin.register(CalificacionHistorico)
class CalificacionHistoricoAdmin(admin.ModelAdmin):
    list_display = ['valor_anterior', 'valor_nuevo', 'calificacion', 'fecha_registro']


@admin.register(CalificacionMejora)
class CalificacionMejoraAdmin(admin.ModelAdmin):
    list_display = ['valor', 'aprobado', 'tipo', 'calificacion']


@admin.register(Incidencia)
class IncidenciaAdmin(admin.ModelAdmin):
    list_display = ['asunto', 'tipo', 'notificar', 'fecha_registro']


@admin.register(Promedio)
class PromedioAdmin(admin.ModelAdmin):
    list_display = ['valor', 'matricula', 'distributivo_asignatura', 'fecha_calculo']


@admin.register(PromedioCategoria)
class PromedioCategoriaAdmin(admin.ModelAdmin):
    list_display = ['valor', 'promedio', 'evaluacion_categoria']
