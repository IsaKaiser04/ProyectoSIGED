import urllib.request, json

BASE = 'http://localhost:8000/api'

def api(method, path, data=None, token=None):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except:
            return e.code, raw

# Login
status, data = api('POST', '/actoresAcademicos/login/', {
    'correo_institucional': 'admin@test.com',
    'contrasena': 'Admin123!'
})
assert status == 200, 'Login failed: ' + str(data)
token = data['token']
print('===== LOGIN OK =====')

# 1. JORNADA CRUD
status, jrn = api('POST', '/distributivos/jornadas/', {
    'nombre': 'Matutina', 'hora_inicio': '07:00', 'hora_fin': '12:30'
}, token=token)
assert status == 201, 'Create jornada failed'
JORNADA_ID = jrn['id']
print('1. Jornada creada: id=' + str(JORNADA_ID))

# 2. Get required data
status, docentes = api('GET', '/actoresAcademicos/docentes/', token=token)
assert status == 200 and len(docentes) > 0, 'Need at least 1 docente'
DOCENTE_ID = docentes[0]['id']
print('2. Docente: id=' + str(DOCENTE_ID))

status, anios = api('GET', '/planificacion/anios-lectivos/', token=token)
assert status == 200 and len(anios) > 0, 'Need at least 1 anio lectivo'
ANIO_ID = anios[0]['id']
print('3. AnioLectivo: id=' + str(ANIO_ID))

status, ofertas = api('GET', '/planificacion/oferta/asignaturas-ofertadas/', token=token)
assert status == 200 and len(ofertas) > 0, 'Need at least 1 asignatura ofertada'
OFERTA_ID = ofertas[0]['id']
print('4. AsignaturaOfertada: id=' + str(OFERTA_ID))

# 3. DISTRIBUTIVO
status, dist = api('POST', '/distributivos/distributivos/', {
    'anio_lectivo': ANIO_ID, 'docente': DOCENTE_ID, 'observacion': 'Test'
}, token=token)
assert status == 201, 'Create distributivo failed: ' + str(dist)
DIST_ID = dist['id']
print('5. Distributivo creado: id=' + str(DIST_ID))

# 4. DISTRIBUTIVO ASIGNATURA
status, asig = api('POST', '/distributivos/distributivos-asignaturas/', {
    'distributivo': DIST_ID, 'asignatura_ofertada': OFERTA_ID, 'observacion': 'Matematicas'
}, token=token)
assert status == 201, 'Create asignatura failed: ' + str(asig)
ASIG_ID = asig['id']
print('6. AsignaturaDistributivo creada: id=' + str(ASIG_ID))

# 5. HORARIO
status, hor = api('POST', '/distributivos/horarios/', {
    'distributivo': DIST_ID,
    'distributivo_asignatura': ASIG_ID,
    'jornada_hora': JORNADA_ID,
    'hora_inicio': '07:00',
    'hora_fin': '08:30',
    'tipo_horario': 'CLASE',
    'dia_semana': 'LUNES',
    'observacion': 'Clase de matematicas'
}, token=token)
assert status == 201, 'Create horario failed: ' + str(hor)
print('7. Horario creado: id=' + str(hor['id']))

# 6. PLANIFICACION CURRICULAR FLOW
status, pc = api('POST', '/distributivos/planificaciones/', {
    'distributivo_asignatura': ASIG_ID,
    'observacion': 'Planificacion curricular',
    'estado': 'BORRADOR'
}, token=token)
assert status == 201, 'Create planificacion failed: ' + str(pc)
PC_ID = pc['id']
print('8a. Planificacion creada: id=' + str(PC_ID) + ' estado=' + pc['estado'])

status, env = api('POST', '/distributivos/planificaciones/' + str(PC_ID) + '/enviar_aprobacion/',
    {'observacion': 'Enviada para revision'}, token=token)
assert status == 200, 'enviar_aprobacion failed: ' + str(env)
assert env['estado'] == 'POR_APROBAR'
print('8b. enviar_aprobacion: OK (estado=POR_APROBAR)')

status, apr = api('POST', '/distributivos/planificaciones/' + str(PC_ID) + '/aprobar/',
    {'observacion': 'Aprobada por autoridad'}, token=token)
assert status == 200, 'aprobar failed: ' + str(apr)
assert apr['estado'] == 'APROBADO'
print('8c. aprobar: OK (estado=APROBADO)')

status, det = api('GET', '/distributivos/planificaciones/' + str(PC_ID) + '/', token=token)
historiales = det.get('historiales', [])
print('8d. Historiales: ' + str(len(historiales)) + ' entries')
for h in historiales:
    print('    ' + h['estado_anterior'] + ' -> ' + h['estado_actual'] + ' : ' + h.get('observacion', ''))

# 7. QUERY ENDPOINTS
status, _ = api('GET', '/distributivos/distributivos/por_anio_lectivo/?anio_lectivo_id=' + str(ANIO_ID), token=token)
assert status == 200
print('9a. distributivos/por_anio_lectivo: OK')

status, _ = api('GET', '/distributivos/distributivos/por_docente/?docente_id=' + str(DOCENTE_ID), token=token)
assert status == 200
print('9b. distributivos/por_docente: OK')

status, _ = api('GET', '/distributivos/horarios/por_distributivo/?distributivo_id=' + str(DIST_ID), token=token)
assert status == 200
print('9c. horarios/por_distributivo: OK')

status, _ = api('GET', '/distributivos/horarios/por_distributivo_asignatura/?distributivo_asignatura_id=' + str(ASIG_ID), token=token)
assert status == 200
print('9d. horarios/por_distributivo_asignatura: OK')

status, _ = api('GET', '/distributivos/planificaciones-historial/por_planificacion/?planificacion_id=' + str(PC_ID), token=token)
assert status == 200
print('9e. planificaciones-historial/por_planificacion: OK')

# 8. Cleanup
api('DELETE', '/distributivos/planificaciones/' + str(PC_ID) + '/', token=token)
api('DELETE', '/distributivos/horarios/' + str(hor['id']) + '/', token=token)
api('DELETE', '/distributivos/distributivos-asignaturas/' + str(ASIG_ID) + '/', token=token)
api('DELETE', '/distributivos/distributivos/' + str(DIST_ID) + '/', token=token)
api('DELETE', '/distributivos/jornadas/' + str(JORNADA_ID) + '/', token=token)
print('10. Cleanup: all test data deleted')

print()
print('===== ALL INTEGRATION FLOWS PASSED =====')
