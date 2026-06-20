"""
WSGI config for sga project.
"""

""" La función de este archivo es configurar el entorno WSGI para el proyecto Django
, estableciendo la variable de entorno para las configuraciones del proyecto 
y obteniendo la aplicación WSGI que se utilizará para servir la aplicación Django 
en un servidor web compatible con WSGI. """

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sga.settings')

application = get_wsgi_application()