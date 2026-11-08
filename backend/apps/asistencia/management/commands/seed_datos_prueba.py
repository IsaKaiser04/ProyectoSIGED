"""Crea datos de prueba (solo para la base LOCAL) para asistencia y su reporte.

Crea 2 grados (6to y 7mo EGB) con paralelos A y B, 4 asignaturas por grado,
4 docentes con distributivo y horario, 8 estudiantes legalizados por paralelo
y asistencias de ejemplo desde el inicio del período académico hasta hoy.

Guarda los IDs de todo lo que crea en un registro JSON. El registro se lee por
la entrada estándar y el registro actualizado sale por la salida estándar
(los mensajes salen por stderr), para guardarlo fuera del contenedor:

    cat ~/siged_datos_prueba.json 2>/dev/null \
      | docker compose exec -T backend python manage.py seed_datos_prueba \
      > ~/siged_datos_prueba.json.nuevo && mv ~/siged_datos_prueba.json.nuevo ~/siged_datos_prueba.json

Se puede volver a ejecutar: lo que ya está en el registro no se vuelve a crear.
Lo que ya existía antes (un grado o asignatura con el mismo nombre) se reutiliza
sin modificarlo y NO se anota en el registro, así nunca se borra.
"""
import json
import random
import sys
import unicodedata
import uuid
from datetime import date, time, timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.actoresAcademicos.models import Cuenta
from apps.actoresAcademicos.models.administrativo import Administrador, Autoridad, Dece, Secretaria
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.models.enums import RolTipo, TipoContrato, TipoDedicacion, TipoIdentificacion
from apps.actoresAcademicos.models.estudiante import Estudiante
from apps.asistencia.models import Asistencia, AsistenciaTipo, Clase, ClaseEstado
from apps.distributivos.models import Distributivo, DistributivoAsignatura, Horario
from apps.distributivos.models.enums import DiasSemana, HorarioTipo
from apps.distributivos.models.jornada_hora import JornadaHora
from apps.institucion.models.institucion import Institucion
from apps.matricula.models import Matricula
from apps.matricula.models.enums import MatriculaEstado
from apps.matricula.models.representante import Representante
from apps.planificacion.models import AnioLectivo, PeriodoAcademico
from apps.planificacion.models.enums import NivelEducativo, SubNivelEducativo
from apps.planificacion.models.oferta import AsignaturaOfertada, GradoOfertado, OfertaAcademica
from apps.planificacion.models.paralelo import JornadaChoices, Paralelo
from apps.planificacion.models.plan_estudio import Asignatura, Grado, PlanEstudio
from apps.ubicacion.models.direccion import Direccion
from apps.ubicacion.models.parroquia import Parroquia

CONTRASENA = 'Prueba2026'
DOMINIO = 'siged.edu.ec'
ANIO_LECTIVO = '2025-2026'
SEMILLA = 2026
ESTUDIANTES_POR_PARALELO = 8

GRADOS = [(6, '6to EGB'), (7, '7mo EGB')]
PARALELOS = ['Paralelo A', 'Paralelo B']
ASIGNATURAS = ['Matemáticas', 'Lengua y Literatura', 'Ciencias Naturales', 'Estudios Sociales']
ASIGNATURAS_CON_ASISTENCIA = ['Matemáticas', 'Lengua y Literatura']

# Un docente por asignatura; da esa asignatura en los 4 paralelos.
DOCENTES = [
    ('Patricia Elizabeth', 'Jaramillo Cueva', 'Matemáticas'),
    ('Luis Fernando', 'Ordóñez Castillo', 'Lengua y Literatura'),
    ('Diana Carolina', 'Sarango Pineda', 'Ciencias Naturales'),
    ('Jorge Andrés', 'Valdivieso Riofrío', 'Estudios Sociales'),
]

# 4 horas de 45 minutos. Cada día las asignaturas rotan de hora, así no hay
# choques en un paralelo ni un docente en dos paralelos a la vez.
HORAS = [
    (time(7, 10), time(7, 55)),
    (time(7, 55), time(8, 40)),
    (time(8, 40), time(9, 25)),
    (time(9, 25), time(10, 10)),
]
DIAS = [DiasSemana.LUNES, DiasSemana.MARTES, DiasSemana.MIERCOLES, DiasSemana.JUEVES, DiasSemana.VIERNES]

NOMBRES_H = ['Mateo', 'Sebastián', 'Santiago', 'Joaquín', 'Emiliano', 'Martín', 'Thiago', 'Josué', 'Andrés',
             'Daniel', 'Gael', 'Benjamín', 'Ian', 'Alejandro', 'Dylan', 'Matías']
NOMBRES_M = ['Valentina', 'Camila', 'Sofía', 'Isabella', 'Doménica', 'Ariana', 'Emily', 'Mía', 'Paula',
             'Nicole', 'Allison', 'Renata', 'Victoria', 'Salomé', 'Danna', 'Antonella']
NOMBRES_ADULTOS_H = ['José Luis', 'Carlos Alberto', 'Manuel Jesús', 'Segundo Ángel', 'Edgar Patricio', 'Wilson Rodrigo']
NOMBRES_ADULTOS_M = ['María Elena', 'Rosa Esther', 'Carmen Lucía', 'Gloria Marisol', 'Lorena Patricia', 'Jenny Maribel']
APELLIDOS = ['Guamán', 'Quizhpe', 'Jaramillo', 'Ochoa', 'Cueva', 'Sarango', 'Castillo', 'Torres', 'Chamba',
             'Armijos', 'Ordóñez', 'Granda', 'Pineda', 'Rojas', 'Cabrera', 'Paccha', 'Japón', 'Tene', 'Macas',
             'Morocho', 'Celi', 'Riofrío', 'Ludeña', 'Valdivieso', 'Aguirre', 'Carrión', 'Espinoza', 'Montaño',
             'Zhunaula', 'Medina', 'Vivanco', 'Iñiguez']
CALLES = ['Av. Universitaria', 'Bolívar', 'Sucre', '18 de Noviembre', 'Lourdes', 'Azuay', 'Mercadillo',
          'Rocafuerte', '10 de Agosto', 'José Antonio Eguiguren', 'Av. Manuel Agustín Aguirre', 'Olmedo']
REFERENCIAS = ['Frente al parque', 'Junto a la tienda de abarrotes', 'Casa de dos pisos color blanco',
               'A media cuadra de la iglesia', 'Diagonal a la farmacia', 'Cerca del mercado']

TEMAS = {
    'Matemáticas': ['Fracciones equivalentes', 'Suma y resta de fracciones', 'Números decimales',
                    'Multiplicación de decimales', 'Problemas con fracciones', 'Perímetro y área'],
    'Lengua y Literatura': ['El sustantivo y sus clases', 'Lectura comprensiva: fábulas', 'El adjetivo calificativo',
                            'Uso de la mayúscula', 'El párrafo y la idea principal', 'Leyendas ecuatorianas'],
}
OBSERVACIONES = {
    AsistenciaTipo.INASISTENCIA: ['Sin justificación', 'No se presentó a clase', 'El representante no avisó'],
    AsistenciaTipo.JUSTIFICADO: ['Presentó certificado médico', 'Cita médica', 'Calamidad doméstica'],
    AsistenciaTipo.ATRASADO: ['Llegó 10 minutos tarde', 'Retraso del transporte', 'Llegó 15 minutos tarde'],
}
PESOS_TIPO = [
    (AsistenciaTipo.ASISTENCIA, 75),
    (AsistenciaTipo.INASISTENCIA, 10),
    (AsistenciaTipo.ATRASADO, 8),
    (AsistenciaTipo.JUSTIFICADO, 7),
]


def sin_tildes(texto):
    return unicodedata.normalize('NFKD', texto).encode('ascii', 'ignore').decode().lower()


def cedula_valida(rng, usadas):
    """Cédula ecuatoriana de Loja (11) con dígito verificador módulo 10."""
    while True:
        base = '11' + str(rng.randint(0, 5)) + ''.join(str(rng.randint(0, 9)) for _ in range(6))
        suma = 0
        for i, d in enumerate(base):
            p = int(d) * (2 if i % 2 == 0 else 1)
            suma += p - 9 if p > 9 else p
        cedula = base + str((10 - suma % 10) % 10)
        if cedula not in usadas:
            usadas.add(cedula)
            return cedula


class Command(BaseCommand):
    help = 'Crea datos de prueba (base local) para asistencia; registro JSON por stdin/stdout.'

    def handle(self, *args, **options):
        self.log = self.stderr
        registro = self._leer_registro()
        self.claves = registro.get('claves', {})
        self.creados = {}
        self.avisos = []

        try:
            with transaction.atomic():
                self._crear_todo()
        except CommandError:
            raise
        except Exception as e:
            raise CommandError(f'No se creó nada (se deshizo todo): {e}') from e

        registro['claves'] = self.claves
        registro['actualizado'] = date.today().isoformat()
        self.stdout.write(json.dumps(registro, ensure_ascii=False, indent=2))

        self.log.write(self.style.SUCCESS('Registros creados en esta ejecución:'))
        if not self.creados:
            self.log.write('  (ninguno: todo ya estaba en el registro)')
        for modelo, n in self.creados.items():
            self.log.write(f'  {modelo}: {n}')
        for aviso in self.avisos:
            self.log.write(self.style.WARNING(f'AVISO: {aviso}'))

    # ------------------------------------------------------------------
    # Registro
    # ------------------------------------------------------------------
    def _leer_registro(self):
        if sys.stdin is None or sys.stdin.isatty():
            return {}
        texto = sys.stdin.read().strip()
        if not texto:
            return {}
        try:
            return json.loads(texto)
        except json.JSONDecodeError as e:
            raise CommandError(f'El registro recibido no es un JSON válido: {e}')

    def _obtener(self, clave, modelo, crear):
        """Devuelve el objeto registrado con esa clave o lo crea y lo anota."""
        anotado = self.claves.get(clave)
        if anotado:
            obj = modelo.objects.filter(pk=anotado[1]).first()
            if obj:
                return obj
        obj = crear()
        etiqueta = modelo._meta.label
        self.claves[clave] = [etiqueta, obj.pk]
        self.creados[etiqueta] = self.creados.get(etiqueta, 0) + 1
        return obj

    def _reutilizar_o_crear(self, clave, modelo, existente, crear, descripcion):
        """Si ya existía antes del script, se reutiliza sin tocarlo ni anotarlo."""
        if clave not in self.claves and existente is not None:
            self.avisos.append(f'{descripcion} ya existía (id {existente.pk}); se reutiliza sin modificarlo.')
            return existente
        return self._obtener(clave, modelo, crear)

    # ------------------------------------------------------------------
    # Datos
    # ------------------------------------------------------------------
    def _crear_todo(self):
        self.rng = random.Random(SEMILLA)
        self.institucion = Institucion.objects.order_by('id').first()
        self.anio = AnioLectivo.objects.filter(nombre=ANIO_LECTIVO).first()
        self.oferta = OfertaAcademica.objects.filter(anioLectivo=self.anio).first() if self.anio else None
        self.plan = PlanEstudio.objects.filter(institucion=self.institucion).order_by('id').first()
        self.jornada = JornadaHora.objects.filter(institucion=self.institucion).order_by('hora_inicio').first()
        self.parroquia = Parroquia.objects.order_by('id').first()
        faltan = [n for n, v in [('institución', self.institucion), (f'año lectivo {ANIO_LECTIVO}', self.anio),
                                 ('oferta académica del año', self.oferta), ('plan de estudio', self.plan),
                                 ('jornada horaria', self.jornada), ('parroquia', self.parroquia)] if not v]
        if faltan:
            raise CommandError(f'Faltan datos base: {", ".join(faltan)}. No se creó nada.')

        self.cedulas_usadas = self._cedulas_existentes()
        self.correos_usados = {c.lower() for c in Cuenta.objects.values_list('correo_institucional', flat=True)}
        self.usuarios_usados = {u.lower() for u in Cuenta.objects.values_list('nombre_usuario', flat=True)}
        self.correos_personales = self._correos_personales_existentes()
        self.hash_contrasena = make_password(CONTRASENA)

        estructura = self._crear_estructura()
        docentes = self._crear_docentes()
        distributivos = self._crear_distributivos_y_horarios(estructura, docentes)
        matriculas = self._crear_estudiantes(estructura)
        self._crear_asistencias(distributivos, matriculas)

    def _cedulas_existentes(self):
        usadas = set()
        for modelo in (Docente, Estudiante, Autoridad, Secretaria, Administrador, Dece, Representante):
            usadas |= set(modelo.objects.values_list('identificacion', flat=True))
        for campo in ('rep_identificacion', 'asp_identificacion'):
            usadas |= set(Matricula.objects.exclude(**{campo: ''}).values_list(campo, flat=True))
        return usadas

    def _correos_personales_existentes(self):
        usados = set()
        for modelo in (Docente, Estudiante, Autoridad, Secretaria, Administrador, Dece):
            usados |= {c.lower() for c in modelo.objects.values_list('correo_personal', flat=True)}
        return usados

    def _correo_institucional(self, nombres, apellidos):
        base = f'{sin_tildes(nombres.split()[0])}.{sin_tildes(apellidos.split()[0])}'
        n, usuario = 1, base
        while f'{usuario}@{DOMINIO}' in self.correos_usados or usuario in self.usuarios_usados:
            n += 1
            usuario = f'{base}{n}'
        self.correos_usados.add(f'{usuario}@{DOMINIO}')
        self.usuarios_usados.add(usuario)
        return usuario, f'{usuario}@{DOMINIO}'

    def _correo_personal(self, usuario):
        n, correo = 1, f'{usuario}@example.com'
        while correo in self.correos_personales:
            n += 1
            correo = f'{usuario}{n}@example.com'
        self.correos_personales.add(correo)
        return correo

    def _celular(self):
        return '09' + ''.join(str(self.rng.randint(0, 9)) for _ in range(8))

    def _direccion(self, clave):
        datos = {
            'calle_principal': self.rng.choice(CALLES),
            'calle_secundaria': self.rng.choice(CALLES),
            'numero_casa': f'{self.rng.randint(1, 30)}-{self.rng.randint(10, 99)}',
            'referencia': self.rng.choice(REFERENCIAS),
        }
        return self._obtener(clave, Direccion, lambda: Direccion.objects.create(parroquia=self.parroquia, **datos))

    def _cuenta(self, clave, usuario, correo, rol):
        return self._obtener(clave, Cuenta, lambda: Cuenta.objects.create(
            nombre_usuario=usuario, correo_institucional=correo, contrasena=self.hash_contrasena,
            rol=rol, es_activo=True,
        ))

    # --- Grados, asignaturas y paralelos -------------------------------
    def _crear_estructura(self):
        estructura = {}  # (anio_grado, nombre_paralelo) -> {'paralelo', 'ao': {asignatura: AsignaturaOfertada}}
        nivel = NivelEducativo.EGB.value
        subnivel = SubNivelEducativo.BASICA_MEDIA.value
        for anio_grado, nombre in GRADOS:
            existente = (
                Grado.objects.filter(institucion=self.institucion, nombre__iexact=nombre).first()
                or Grado.objects.filter(planEstudio=self.plan, nivel=nivel, subnivel=subnivel,
                                        anioGrado=anio_grado).first()
            )
            grado = self._reutilizar_o_crear(
                f'grado:{anio_grado}', Grado, existente,
                lambda: Grado.objects.create(nombre=nombre, planEstudio=self.plan, nivel=nivel, subnivel=subnivel,
                                             anioGrado=anio_grado, institucion=self.institucion),
                f'El grado "{nombre}"',
            )
            grado_of = self._reutilizar_o_crear(
                f'grado_ofertado:{anio_grado}', GradoOfertado,
                GradoOfertado.objects.filter(ofertaAcademica=self.oferta, grado=grado).first(),
                lambda: GradoOfertado.objects.create(nombre=nombre, ofertaAcademica=self.oferta, grado=grado),
                f'El grado ofertado "{nombre}"',
            )
            ofertadas = {}
            for nombre_asig in ASIGNATURAS:
                asignatura = self._reutilizar_o_crear(
                    f'asignatura:{anio_grado}:{nombre_asig}', Asignatura,
                    Asignatura.objects.filter(grado=grado, nombre__iexact=nombre_asig).first(),
                    lambda: Asignatura.objects.create(nombre=nombre_asig, grado=grado,
                                                      periodoPedagogicoSemanaMinimo=5),
                    f'La asignatura "{nombre_asig}" de {nombre}',
                )
                ofertadas[nombre_asig] = self._reutilizar_o_crear(
                    f'asignatura_ofertada:{anio_grado}:{nombre_asig}', AsignaturaOfertada,
                    AsignaturaOfertada.objects.filter(gradoOfertado=grado_of, asignatura=asignatura).first(),
                    lambda: AsignaturaOfertada.objects.create(nombre=nombre_asig, gradoOfertado=grado_of,
                                                              asignatura=asignatura),
                    f'La asignatura ofertada "{nombre_asig}" de {nombre}',
                )
            for nombre_par in PARALELOS:
                existente = Paralelo.objects.filter(gradoOfertado=grado_of, nombre__iexact=nombre_par).first()
                paralelo = self._reutilizar_o_crear(
                    f'paralelo:{anio_grado}:{nombre_par}', Paralelo, existente,
                    lambda: Paralelo.objects.create(nombre=nombre_par, gradoOfertado=grado_of, cuposMaximo=35,
                                                    cuposOcupados=ESTUDIANTES_POR_PARALELO,
                                                    jornada=JornadaChoices.MATUTINA),
                    f'El paralelo "{nombre_par}" de {nombre}',
                )
                estructura[(anio_grado, nombre_par)] = {'paralelo': paralelo, 'ao': ofertadas}
        return estructura

    # --- Docentes ------------------------------------------------------
    def _crear_docentes(self):
        docentes = {}
        for i, (nombres, apellidos, especialidad) in enumerate(DOCENTES):
            clave = f'docente:{i}'
            if clave in self.claves and Docente.objects.filter(pk=self.claves[clave][1]).exists():
                docentes[especialidad] = Docente.objects.get(pk=self.claves[clave][1])
                continue
            usuario, correo = self._correo_institucional(nombres, apellidos)
            cuenta = self._cuenta(f'cuenta:docente:{i}', usuario, correo, RolTipo.DOCENTE)
            direccion = self._direccion(f'direccion:docente:{i}')
            datos = {
                'nombres': nombres, 'apellidos': apellidos,
                'identificacion': cedula_valida(self.rng, self.cedulas_usadas),
                'tipo_identificacion': TipoIdentificacion.CEDULA,
                'fecha_nacimiento': date(self.rng.randint(1975, 1992), self.rng.randint(1, 12), self.rng.randint(1, 28)),
                'celular': self._celular(),
                'correo_personal': self._correo_personal(usuario),
                'cuenta': cuenta, 'especialidad': especialidad,
                'fecha_ingreso': date(self.rng.randint(2012, 2022), self.rng.randint(1, 12), 1),
                'tipo_contrato': TipoContrato.TITULAR, 'tipo_dedicacion': TipoDedicacion.TIEMPO_COMPLETO,
                'institucion': self.institucion, 'direccion_domicilio': direccion,
            }
            docentes[especialidad] = self._obtener(clave, Docente, lambda: Docente.objects.create(**datos))
        return docentes

    # --- Distributivo y horarios ---------------------------------------
    def _crear_distributivos_y_horarios(self, estructura, docentes):
        das = {}  # (anio_grado, paralelo, asignatura) -> DistributivoAsignatura
        claves_paralelos = list(estructura.keys())
        for s, nombre_asig in enumerate(ASIGNATURAS):
            docente = docentes[nombre_asig]
            distributivo = self._obtener(
                f'distributivo:{s}', Distributivo,
                lambda: Distributivo.objects.create(anio_lectivo=self.anio, docente=docente, observacion=''),
            )
            for p, (anio_grado, nombre_par) in enumerate(claves_paralelos):
                info = estructura[(anio_grado, nombre_par)]
                da = self._obtener(
                    f'distributivo_asignatura:{anio_grado}:{nombre_par}:{nombre_asig}', DistributivoAsignatura,
                    lambda: DistributivoAsignatura.objects.create(
                        distributivo=distributivo, asignatura_ofertada=info['ao'][nombre_asig],
                        paralelo=info['paralelo'],
                    ),
                )
                das[(anio_grado, nombre_par, nombre_asig)] = da
                for d, dia in enumerate(DIAS):
                    h = (s - d - p) % len(HORAS)  # rotación sin choques
                    inicio, fin = HORAS[h]
                    self._obtener(
                        f'horario:{anio_grado}:{nombre_par}:{nombre_asig}:{dia}', Horario,
                        lambda: Horario.objects.create(
                            distributivo=distributivo, distributivo_asignatura=da, jornada_hora=self.jornada,
                            hora_inicio=inicio, hora_fin=fin, tipo_horario=HorarioTipo.CLASE, dia_semana=dia,
                        ),
                    )
        return das

    # --- Estudiantes y matrículas --------------------------------------
    def _crear_estudiantes(self, estructura):
        matriculas = {}  # (anio_grado, paralelo) -> [Matricula]
        nombres_usados = set()
        for (anio_grado, nombre_par), info in estructura.items():
            lista = []
            for n in range(ESTUDIANTES_POR_PARALELO):
                sufijo = f'{anio_grado}:{nombre_par}:{n}'
                clave = f'estudiante:{sufijo}'
                if clave in self.claves and Estudiante.objects.filter(pk=self.claves[clave][1]).exists():
                    estudiante = Estudiante.objects.get(pk=self.claves[clave][1])
                else:
                    estudiante = self._nuevo_estudiante(sufijo, anio_grado, n, nombres_usados)
                lista.append(self._matricula(sufijo, estudiante, info['paralelo']))
            matriculas[(anio_grado, nombre_par)] = lista
        return matriculas

    def _nuevo_estudiante(self, sufijo, anio_grado, n, nombres_usados):
        lista_nombres = NOMBRES_H if n % 2 == 0 else NOMBRES_M
        while True:
            nombres = ' '.join(self.rng.sample(lista_nombres, 2))
            apellidos = ' '.join(self.rng.sample(APELLIDOS, 2))
            if (nombres, apellidos) not in nombres_usados:
                nombres_usados.add((nombres, apellidos))
                break
        usuario, correo = self._correo_institucional(nombres, apellidos)
        cuenta = self._cuenta(f'cuenta:estudiante:{sufijo}', usuario, correo, RolTipo.ESTUDIANTE)
        direccion = self._direccion(f'direccion:estudiante:{sufijo}')
        nacimiento_anio = date.today().year - (anio_grado + 5)
        datos = {
            'nombres': nombres, 'apellidos': apellidos,
            'identificacion': cedula_valida(self.rng, self.cedulas_usadas),
            'tipo_identificacion': TipoIdentificacion.CEDULA,
            'fecha_nacimiento': date(nacimiento_anio, self.rng.randint(1, 12), self.rng.randint(1, 28)),
            'celular': self._celular(),
            'correo_personal': self._correo_personal(usuario),
            'cuenta': cuenta, 'institucion': self.institucion, 'direccion_domicilio': direccion,
        }
        return self._obtener(f'estudiante:{sufijo}', Estudiante, lambda: Estudiante.objects.create(**datos))

    def _matricula(self, sufijo, estudiante, paralelo):
        def crear():
            es_madre = self.rng.random() < 0.6
            primer_apellido = estudiante.apellidos.split()[0]
            return Matricula.objects.create(
                codigo_unico=f'MAT-{date.today().year}-{uuid.uuid4().hex[:6].upper()}',
                estado=MatriculaEstado.LEGALIZADA,
                estudiante=estudiante, paralelo=paralelo, anio_lectivo=self.anio, institucion=self.institucion,
                rep_nombres=self.rng.choice(NOMBRES_ADULTOS_M if es_madre else NOMBRES_ADULTOS_H),
                rep_apellidos=(f'{estudiante.apellidos.split()[-1]} {self.rng.choice(APELLIDOS)}' if es_madre
                               else f'{primer_apellido} {self.rng.choice(APELLIDOS)}'),
                rep_identificacion=cedula_valida(self.rng, self.cedulas_usadas),
                rep_telefono=self._celular(),
                rep_parentesco='Madre' if es_madre else 'Padre',
                asp_nombres=estudiante.nombres, asp_apellidos=estudiante.apellidos,
                asp_identificacion=estudiante.identificacion, asp_tipo_identificacion=TipoIdentificacion.CEDULA,
                asp_fecha_nacimiento=estudiante.fecha_nacimiento, asp_celular=estudiante.celular or '',
                asp_correo_personal=estudiante.correo_personal,
            )
        return self._obtener(f'matricula:{sufijo}', Matricula, crear)

    # --- Clases y asistencias ------------------------------------------
    def _crear_asistencias(self, das, matriculas):
        hoy = date.today()
        periodo = PeriodoAcademico.objects.filter(
            anioLectivo=self.anio, fechaInicio__lte=hoy, fechaFin__gte=hoy
        ).first()
        if not periodo:
            self.avisos.append('Hoy no está dentro de ningún período académico; no se crearon asistencias.')
            return
        dias_por_nombre = {i: dia for i, dia in enumerate(DIAS)}
        fecha = periodo.fechaInicio
        while fecha <= hoy:
            dia = dias_por_nombre.get(fecha.weekday())
            if dia:
                for (anio_grado, nombre_par), lista in matriculas.items():
                    for nombre_asig in ASIGNATURAS_CON_ASISTENCIA:
                        da = das[(anio_grado, nombre_par, nombre_asig)]
                        horario = Horario.objects.filter(
                            distributivo_asignatura=da, dia_semana=dia
                        ).order_by('hora_inicio').first()
                        if not horario:
                            continue
                        self._clase_con_asistencias(da, horario, fecha, periodo, nombre_asig, lista)
            fecha += timedelta(days=1)

    def _clase_con_asistencias(self, da, horario, fecha, periodo, nombre_asig, matriculas):
        clave_clase = f'clase:{da.pk}:{fecha.isoformat()}'
        rng = random.Random(f'{SEMILLA}:{clave_clase}')
        tema = rng.choice(TEMAS[nombre_asig])
        clase = self._obtener(clave_clase, Clase, lambda: Clase.objects.create(
            tema=tema, descripcion='Clase registrada con datos de prueba', fecha=fecha,
            hora_inicio=horario.hora_inicio, hora_fin=horario.hora_fin, estado=ClaseEstado.FINALIZADO,
            distributivo_asignatura=da, horario=horario, periodo_academico=periodo,
        ))
        tipos = [t for t, _ in PESOS_TIPO]
        pesos = [p for _, p in PESOS_TIPO]
        for matricula in matriculas:
            tipo = rng.choices(tipos, weights=pesos)[0]
            observacion = rng.choice(OBSERVACIONES[tipo]) if tipo in OBSERVACIONES else ''
            notificar = tipo == AsistenciaTipo.INASISTENCIA and rng.random() < 0.5
            self._obtener(
                f'asistencia:{clase.pk}:{matricula.pk}', Asistencia,
                lambda: Asistencia.objects.create(clase=clase, matricula=matricula, tipo=tipo,
                                                  observacion=observacion, notificar=notificar),
            )
