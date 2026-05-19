from django.contrib import admin
from .models import Distributivo

@admin.register(Distributivo)
class DistributivoAdmin(admin.ModelAdmin):
    list_display = ['docente', 'materia', 'paralelo', 'horas', 'horario', 'created_at']
    list_filter = ['paralelo', 'created_at', 'updated_at']
    search_fields = ['docente', 'materia', 'horario']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información básica', {
            'fields': ('docente', 'materia', 'paralelo')
        }),
        ('Asignación', {
            'fields': ('horas', 'horario')
        }),
        ('Registro', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )