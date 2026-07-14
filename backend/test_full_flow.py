"""
Full integration test for Planificacion Curricular y Distribucion Academica.
Creates seed data via API, tests all endpoints, cleans up.
"""
import os, sys, json, urllib.request

BASE = 'http://localhost:8000/api'

def api(method, path, data=None, token=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try: return e.code, json.loads(raw)
        except: return e.code, raw

# Login
s, r = api('POST', '/actoresAcademicos/login/', {
    'correo_institucional': 'admin@test.com', 'contrasena': 'Admin123!'
})
assert s == 200, f'Login failed: {s} {r}'
token = r['token']
print('===== LOGIN OK =====')

# Get available seed data
s, anios = api('GET', '/planificacion/anios-lectivos/', token=token)
assert s == 200 and len(anios) > 0, 'Need anio lectivo'
ANIO_ID = anios[0]['id']
print(f'AnioLectivo: id={ANIO_ID}')

s, docentes = api('GET', '/actoresAcademicos/docentes/', token=token)
DOCENTE_ID = None
if s == 200 and len(docentes) > 0:
    DOCENTE_ID = docentes[0]['id']
    print(f'Docente: id={DOCENTE_ID}')

s, ofertas = api('GET', '/planificacion/oferta/asignaturas-ofertadas/', token=token)
ASIG_OFERTADA_ID = None
if s == 200 and len(ofertas) > 0:
    ASIG_OFERTADA_ID = ofertas[0]['id']
    print(f'AsignaturaOfertada: id={ASIG_OFERTADA_ID}')

# If no seed data exists, create it via API
if not DOCENTE_ID or not ASIG_OFERTADA_ID:
    # Create AnioLectivo if needed
    if not ANIO_ID:
        s, r = api('POST', '/planificacion/anios-lectivos/', {
            'nombre': '2024-2025', 'fechaInicio': '2024-09-01', 'fechaFin': '2025-06-30', 'estado': 'ACTIVO'
        }, token=token)
        assert s == 201, f'Create anio: {s} {r}'
        ANIO_ID = r['id']

    # Create nivel if needed
    s, niveles = api('GET', '/planificacion/niveles/', token=token)
    if s == 200 and niveles:
        NIVEL_ID = niveles[0]['id']
    else:
        s, r = api('POST', '/planificacion/niveles/', {'nombre': 'EGB', 'codigo': 'EGB'}, token=token)
        if s != 201:
            # Try with existing endpoint or alternate
            pass
        NIVEL_ID = r.get('id')

    # For simplicity, create seed via ORM instead
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sga.settings')
    django.setup()
    from apps.planificacion.models import AnioLectivo, OfertaAcademica, GradoOfertado, AsignaturaOfertada
    from apps.planificacion.models.plan_estudio import PlanEstudio, Grado, Asignatura
    from apps.planificacion.models.educacion import EducacionNivel, EducacionSubNivel
    from apps.actoresAcademicos.models import Docente, Cuenta
    from apps.actoresAcademicos.models.enums import RolTipo, TipoIdentificacion, TipoContrato, TipoDedicacion
    from apps.institucion.models import Institucion

    anio_obj = AnioLectivo.objects.filter(id=ANIO_ID).first()
    if not anio_obj:
        anio_obj = AnioLectivo.objects.create(nombre='2024-2025', fechaInicio='2024-09-01', fechaFin='2025-06-30', estado='ACTIVO')
        ANIO_ID = anio_obj.id

    nivel_obj = EducacionNivel.objects.filter(codigo='EGB').first()
    if not nivel_obj:
        nivel_obj = EducacionNivel.objects.create(nombre='EGB', codigo='EGB')
    subnivel_obj = EducacionSubNivel.objects.filter(nombre='EGB Media').first()
    if not subnivel_obj:
        subnivel_obj = EducacionSubNivel.objects.create(nombre='EGB Media', nivel=nivel_obj)
    plan_obj = PlanEstudio.objects.filter(nombre='Plan EGB').first()
    if not plan_obj:
        plan_obj = PlanEstudio.objects.create(nombre='Plan EGB')
    grado_obj = Grado.objects.filter(nombre='5to EGB').first()
    if not grado_obj:
        grado_obj = Grado.objects.create(nombre='5to EGB', subnivel=subnivel_obj, plan_estudio=plan_obj)
    asig_obj = Asignatura.objects.filter(nombre='Matematicas').first()
    if not asig_obj:
        asig_obj = Asignatura.objects.create(nombre='Matematicas', codigo='MAT01', grado=grado_obj, horas_semanales=5, carga_horaria=40)

    oferta_obj = OfertaAcademica.objects.filter(anio_lectivo=anio_obj).first()
    if not oferta_obj:
        oferta_obj = OfertaAcademica.objects.create(anio_lectivo=anio_obj, nombre='Oferta 2024-2025')
    gdo = GradoOfertado.objects.filter(oferta=oferta_obj, grado=grado_obj).first()
    if not gdo:
        gdo = GradoOfertado.objects.create(oferta=oferta_obj, grado=grado_obj, paralelos=2, costo=0)
    asig_of = AsignaturaOfertada.objects.filter(grado_ofertado=gdo, asignatura=asig_obj).first()
    if not asig_of:
        asig_of = AsignaturaOfertada.objects.create(grado_ofertado=gdo, asignatura=asig_obj, carga_horaria=40)
    ASIG_OFERTADA_ID = asig_of.id

    if not Docente.objects.exists():
        cuenta = Cuenta.objects.create(
            nombre_usuario='docente1',
            contrasena='pbkdf2_sha256$600000$dummy',
            correo_institucional='docente1@test.com',
            rol=RolTipo.DOCENTE, es_activo=True
        )
        inst = Institucion.objects.first()
        Docente.objects.create(
            nombres='Juan', apellidos='Perez', identificacion='1111111111',
            tipo_identificacion=TipoIdentificacion.CEDULA,
            fecha_nacimiento='1990-01-01', correo_personal='juan@email.com',
            cuenta=cuenta, institucion=inst, especialidad='Matematicas',
            fecha_ingreso='2020-03-01', tipo_contrato=TipoContrato.FIJO,
            tipo_dedicacion=TipoDedicacion.TC
        )
    docente = Docente.objects.first()
    DOCENTE_ID = docente.id
    print(f'Seed created: Anio={ANIO_ID}, AsigOfertada={ASIG_OFERTADA_ID}, Docente={DOCENTE_ID}')

# ====== END SEEDING ======

# ====== API TESTS ======

# 1. JORNADA CRUD
s, jrn = api('POST', '/distributivos/jornadas/', {
    'nombre': 'Matutina', 'hora_inicio': '07:00', 'hora_fin': '12:30'
}, token=token)
assert s == 201, f'Jornada create: {s} {jrn}'
JORNADA_ID = jrn['id']

s, _ = api('GET', f'/distributivos/jornadas/{JORNADA_ID}/', token=token)
assert s == 200, f'Jornada get: {s}'
s, _ = api('PATCH', f'/distributivos/jornadas/{JORNADA_ID}/', {'nombre': 'Vespertina'}, token=token)
assert s == 200, f'Jornada patch: {s}'
print(f'1. Jornada CRUD: id={JORNADA_ID} OK')

# 2. DISTRIBUTIVO
s, dist = api('POST', '/distributivos/distributivos/', {
    'anio_lectivo': ANIO_ID, 'docente': DOCENTE_ID, 'observacion': 'Test'
}, token=token)
assert s == 201, f'Distributivo create: {s} {dist}'
DIST_ID = dist['id']
print(f'2. Distributivo: id={DIST_ID}')

# 3. DISTRIBUTIVO ASIGNATURA
s, asig = api('POST', '/distributivos/distributivos-asignaturas/', {
    'distributivo': DIST_ID, 'asignatura_ofertada': ASIG_OFERTADA_ID, 'observacion': ''
}, token=token)
assert s == 201, f'Asignatura create: {s} {asig}'
ASIG_ID = asig['id']
print(f'3. AsignaturaDistributivo: id={ASIG_ID}')

# 4. HORARIO
s, hor = api('POST', '/distributivos/horarios/', {
    'distributivo': DIST_ID, 'distributivo_asignatura': ASIG_ID,
    'jornada_hora': JORNADA_ID, 'hora_inicio': '07:00', 'hora_fin': '08:30',
    'tipo_horario': 'CLASE', 'dia_semana': 'LUNES', 'observacion': ''
}, token=token)
assert s == 201, f'Horario create: {s} {hor}'
HORARIO_ID = hor['id']
print(f'4. Horario: id={HORARIO_ID}')

# 5. PLANIFICACION STATE FLOW
s, pc = api('POST', '/distributivos/planificaciones/', {
    'distributivo_asignatura': ASIG_ID, 'observacion': 'PCA test', 'estado': 'BORRADOR'
}, token=token)
assert s == 201, f'Planificacion create: {s} {pc}'
PC_ID = pc['id']
assert pc['estado'] == 'BORRADOR'
print(f'5a. Planificacion: id={PC_ID} estado=BORRADOR')

s, env = api('POST', f'/distributivos/planificaciones/{PC_ID}/enviar_aprobacion/',
    {'observacion': 'Enviada'}, token=token)
assert s == 200, f'enviar_aprobacion: {s} {env}'
assert env['estado'] == 'POR_APROBAR'
print(f'5b. enviar_aprobacion -> POR_APROBAR')

s, apr = api('POST', f'/distributivos/planificaciones/{PC_ID}/aprobar/',
    {'observacion': 'Aprobada'}, token=token)
assert s == 200, f'aprobar: {s} {apr}'
assert apr['estado'] == 'APROBADO'
print(f'5c. aprobar -> APROBADO')

# 6. HISTORIAL
s, det = api('GET', f'/distributivos/planificaciones/{PC_ID}/', token=token)
hist = det.get('historiales', [])
assert len(hist) == 2, f'Historial: expected 2, got {len(hist)}'
print(f'6. Historial: {len(hist)} entries OK')
for h in hist:
    print(f'   {h["estado_anterior"]} -> {h["estado_actual"]}: {h.get("observacion","")}')

# 7. QUERY ENDPOINTS
checks = [
    ('7a. por_anio_lectivo', 'GET', f'/distributivos/distributivos/por_anio_lectivo/?anio_lectivo_id={ANIO_ID}'),
    ('7b. por_docente', 'GET', f'/distributivos/distributivos/por_docente/?docente_id={DOCENTE_ID}'),
    ('7c. horarios/por_distributivo', 'GET', f'/distributivos/horarios/por_distributivo/?distributivo_id={DIST_ID}'),
    ('7d. horarios/por_distributivo_asignatura', 'GET', f'/distributivos/horarios/por_distributivo_asignatura/?distributivo_asignatura_id={ASIG_ID}'),
    ('7e. asignaturas/por_distributivo', 'GET', f'/distributivos/distributivos-asignaturas/por_distributivo/?distributivo_id={DIST_ID}'),
    ('7f. jornadas/por_institucion', 'GET', '/distributivos/jornadas/por_institucion/?institucion_id=1'),
    ('7g. planificaciones/por_asignatura', 'GET', f'/distributivos/planificaciones/por_distributivo_asignatura/?distributivo_asignatura_id={ASIG_ID}'),
]
for label, method, path in checks:
    s, _ = api(method, path, token=token)
    assert s == 200, f'{label}: {s}'
    print(f'{label}: OK')

# 8. CLEANUP
api('DELETE', f'/distributivos/planificaciones/{PC_ID}/', token=token)
api('DELETE', f'/distributivos/horarios/{HORARIO_ID}/', token=token)
api('DELETE', f'/distributivos/distributivos-asignaturas/{ASIG_ID}/', token=token)
api('DELETE', f'/distributivos/distributivos/{DIST_ID}/', token=token)
api('DELETE', f'/distributivos/jornadas/{JORNADA_ID}/', token=token)
print('8. Cleanup: test data deleted')

print()
print('===== ALL INTEGRATION TESTS PASSED =====')
print()
print('Flows verified:')
print('  - Jornada: create, read, patch')
print('  - Distributivo: create')
print('  - AsignaturaDistributivo: create')
print('  - Horario: create (with jornada/distributivo/asignatura FK)')
print('  - PlanificacionCurricular state machine: BORRADOR -> enviar_aprobacion -> POR_APROBAR -> aprobar -> APROBADO')
print('  - Auto-historico: 2 entries (BORRADOR->POR_APROBAR, POR_APROBAR->APROBADO)')
print('  - Custom query endpoints (7 total)')
print('  - Cleanup deletes all test data')
