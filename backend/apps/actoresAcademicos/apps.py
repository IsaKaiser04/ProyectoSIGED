from django.apps import AppConfig

#Su función es configurar la aplicaciónes, estableciendo el nombre de la aplicación y el tipo de campo de clave primaria predeterminado para los modelos.
class ActoresacademicosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.actoresAcademicos'