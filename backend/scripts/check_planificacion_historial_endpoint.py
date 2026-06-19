import os, sys, django, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sga.settings')
ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

django.setup()
from django.test import Client
from apps.distributivos.models import Distributivo, DistributivoAsignatura, PlanificacionCurricular
from django.conf import settings

# Allow test client host
if hasattr(settings, 'ALLOWED_HOSTS'):
    try:
        settings.ALLOWED_HOSTS.append('testserver')
    except Exception:
        settings.ALLOWED_HOSTS = ['testserver']

client = Client()

# Ensure there is a distributivo and planificacion
D = Distributivo.objects.create(anio_lectivo_referencia='2026', docente_referencia='Checker')
DA = DistributivoAsignatura.objects.create(distributivo=D, asignatura_ofertada_referencia='Test')
PC = PlanificacionCurricular.objects.create(distributivo_asignatura=DA, observacion='Seed for endpoint check')

print('Created PlanificacionCurricular id', PC.id)

# Check GET
resp = client.get('/api/planificaciones-historial/')
print('GET /api/planificaciones-historial/ status:', resp.status_code)
try:
    print('GET response JSON:', json.dumps(resp.json(), indent=2, ensure_ascii=False))
except Exception:
    print('GET response content:', resp.content[:500])

# Check POST
post_data = {
    'planificacion_curricular': PC.id,
    'estado_anterior': 'BORRADOR',
    'estado_actual': 'POR_APROBAR',
    'observacion': 'Prueba automatizada'
}
resp2 = client.post('/api/planificaciones-historial/', post_data)
print('POST /api/planificaciones-historial/ status:', resp2.status_code)
try:
    print('POST response JSON:', json.dumps(resp2.json(), indent=2, ensure_ascii=False))
except Exception:
    print('POST response content:', resp2.content[:500])
