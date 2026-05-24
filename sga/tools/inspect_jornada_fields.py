import os
import sys
import django

# Asegurar que la ruta del proyecto está en sys.path para importar 'sga'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sga.settings')
django.setup()
from apps.distributivos.models import JornadaHora
for f in JornadaHora._meta.get_fields():
	print(f.name, type(f), repr(f))

print('\nHas attribute jornada_laboral_referencia on class:', hasattr(JornadaHora, 'jornada_laboral_referencia'))
import importlib
mod = importlib.import_module(JornadaHora.__module__)
print('Model loaded from module:', JornadaHora.__module__, '->', getattr(mod, '__file__', 'n/a'))
