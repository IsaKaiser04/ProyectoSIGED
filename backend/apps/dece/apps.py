from pathlib import Path

from django.apps import AppConfig


class DeceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.dece'
    path = Path(__file__).resolve().parent