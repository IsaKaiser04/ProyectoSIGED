from datetime import date, datetime

from django.db import transaction

from apps.asistencia.models import Asistencia, AsistenciaTipo, Clase
from apps.asistencia.repositories.asistencia_repository import AsistenciaRepository
from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer


DIAS_SEMANA = {
    0: 'LUNES', 1: 'MARTES', 2: 'MIERCOLES',
    3: 'JUEVES', 4: 'VIERNES', 5: 'SABADO', 6: 'DOMINGO',
}

# Solo se puede notificar cuando NO asistió normalmente (US-043)
TIPOS_NOTIFICABLES = {
    AsistenciaTipo.INASISTENCIA,
    AsistenciaTipo.JUSTIFICADO,
    AsistenciaTipo.ATRASADO,
}

ROLES_DOCENTE = ('DOCENTE', 'DOCENTE_TUTOR')
ROLES_GESTION = ('ADMINISTRADOR', 'AUTORIDAD', 'SECRETARIA')


class AsistenciaError(Exception):
    """Error de negocio con un mensaje claro para el frontend."""

    def __init__(self, mensaje, status=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status = status


class AsistenciaService:
    # ------------------------------------------------------------------
    # CRUD básico (sin cambios)
    # ------------------------------------------------------------------
    @staticmethod
    def list_all():
        return AsistenciaSerializer(AsistenciaRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        asistencia = AsistenciaRepository.get_by_id(pk)
        return AsistenciaSerializer(asistencia).data if asistencia else None

    @staticmethod
    def create(data):
        serializer = AsistenciaSerializer(data=data)
        if serializer.is_valid():
            instance = AsistenciaRepository.create(serializer.validated_data)
            return AsistenciaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        asistencia = AsistenciaRepository.get_by_id(pk)
        if not asistencia:
            return None, None
        serializer = AsistenciaSerializer(asistencia, data=data, partial=True)
        if serializer.is_valid():
            instance = AsistenciaRepository.update(asistencia, serializer.validated_data)
            return AsistenciaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def delete(pk):
        asistencia = AsistenciaRepository.get_by_id(pk)
        if not asistencia:
            return False
        AsistenciaRepository.delete(asistencia)
        return True

    # ------------------------------------------------------------------
    # Utilidades
    # ------------------------------------------------------------------
    @staticmethod
    def _parse_fecha(fecha_str):
        if not fecha_str:
            raise AsistenciaError('La fecha es obligatoria.')
        try:
            return datetime.strptime(str(fecha_str), '%Y-%m-%d').date()
        except ValueError:
            raise AsistenciaError('Formato de fecha inválido. Use AAAA-MM-DD.')

    @staticmethod
    def _docente_de(user):
        return getattr(user, 'perfil_docente', None)

    @staticmethod
    def _obtener_distributivo_asignatura(das_id, user):
        """Devuelve la asignatura del distributivo validando que el docente sea el dueño."""
        from apps.distributivos.models import DistributivoAsignatura

        if not das_id:
            raise AsistenciaError('Debe seleccionar una asignatura.')
        da = DistributivoAsignatura.objects.select_related(
            'distributivo__docente', 'distributivo__anio_lectivo',
            'asignatura_ofertada__gradoOfertado', 'paralelo',
        ).filter(pk=das_id).first()
        if not da:
            raise AsistenciaError('La asignatura seleccionada no existe en el distributivo.', 404)
        if not da.paralelo_id:
            raise AsistenciaError('La asignatura no tiene un paralelo asignado en el distributivo.')

        if user.rol in ROLES_GESTION:
            return da
        docente = AsistenciaService._docente_de(user)
        if not docente or not da.distributivo or da.distributivo.docente_id != docente.id:
            raise AsistenciaError('Solo el docente asignado puede ver o registrar la asistencia de esta asignatura.', 403)
        return da

    @staticmethod
    def _periodo_academico(da, fecha):
        """Período académico (bimestre/trimestre/quimestre) que contiene la fecha (US-042)."""
        from apps.planificacion.models import PeriodoAcademico

        anio = da.distributivo.anio_lectivo if da.distributivo else None
        if not anio:
            return None
        return PeriodoAcademico.objects.filter(
            anioLectivo=anio, fechaInicio__lte=fecha, fechaFin__gte=fecha
        ).first()

    @staticmethod
    def _horario_de(da, horario_id, fecha):
        from apps.distributivos.models import Horario

        if not horario_id:
            raise AsistenciaError('Debe indicar el horario de la clase.')
        horario = Horario.objects.filter(pk=horario_id, distributivo_asignatura=da).first()
        if not horario:
            raise AsistenciaError('El horario no pertenece a esta asignatura.')
        if horario.dia_semana != DIAS_SEMANA[fecha.weekday()]:
            raise AsistenciaError(
                f'El horario es del día {horario.dia_semana.lower()} y la fecha seleccionada no coincide.'
            )
        return horario

    @staticmethod
    def _obtener_o_crear_clase(da, horario, fecha):
        clase = Clase.objects.filter(distributivo_asignatura=da, horario=horario, fecha=fecha).first()
        if clase:
            if clase.periodo_academico_id is None:
                clase.periodo_academico = AsistenciaService._periodo_academico(da, fecha)
                clase.save(update_fields=['periodo_academico'])
            return clase
        nombre = da.asignatura_ofertada.nombre if da.asignatura_ofertada else 'Clase'
        return Clase.objects.create(
            tema=f'{nombre} - {fecha.strftime("%d/%m/%Y")}',
            descripcion='',
            fecha=fecha,
            hora_inicio=horario.hora_inicio,
            hora_fin=horario.hora_fin,
            distributivo_asignatura=da,
            horario=horario,
            periodo_academico=AsistenciaService._periodo_academico(da, fecha),
        )

    @staticmethod
    def _matriculas_legalizadas(paralelo_id):
        from apps.matricula.models import Matricula
        from apps.matricula.models.enums import MatriculaEstado

        return Matricula.objects.filter(
            paralelo_id=paralelo_id, estado=MatriculaEstado.LEGALIZADA, estudiante__isnull=False
        ).select_related('estudiante').order_by('estudiante__apellidos', 'estudiante__nombres')

    # ------------------------------------------------------------------
    # Docente
    # ------------------------------------------------------------------
    @staticmethod
    def mis_asignaturas(user):
        """Asignaturas (distributivo) del docente que inició sesión."""
        from apps.distributivos.models import DistributivoAsignatura

        qs = DistributivoAsignatura.objects.select_related(
            'distributivo__docente', 'distributivo__anio_lectivo',
            'asignatura_ofertada__gradoOfertado', 'paralelo',
        ).filter(paralelo__isnull=False, asignatura_ofertada__isnull=False)

        if user.rol in ROLES_DOCENTE:
            docente = AsistenciaService._docente_de(user)
            if not docente:
                return []
            qs = qs.filter(distributivo__docente=docente)
        elif user.rol not in ROLES_GESTION:
            return []

        resultado = []
        for da in qs:
            anio = da.distributivo.anio_lectivo if da.distributivo else None
            grado = da.asignatura_ofertada.gradoOfertado
            docente = da.distributivo.docente if da.distributivo else None
            resultado.append({
                'distributivo_asignatura_id': da.id,
                'asignatura': da.asignatura_ofertada.nombre,
                'grado': grado.nombre if grado else '',
                'paralelo': da.paralelo.nombre,
                'paralelo_id': da.paralelo_id,
                'anio_lectivo': anio.nombre if anio else '',
                'anio_lectivo_id': anio.id if anio else None,
                'docente': f'{docente.nombres} {docente.apellidos}' if docente else '',
            })
        resultado.sort(key=lambda x: (x['anio_lectivo'], x['grado'], x['paralelo'], x['asignatura']))
        return resultado

    @staticmethod
    def matriz(das_id, fecha_str, user):
        """Horarios del día (columnas) x estudiantes legalizados del paralelo (filas)."""
        from apps.distributivos.models import Horario

        fecha = AsistenciaService._parse_fecha(fecha_str)
        da = AsistenciaService._obtener_distributivo_asignatura(das_id, user)
        dia_semana = DIAS_SEMANA[fecha.weekday()]
        periodo = AsistenciaService._periodo_academico(da, fecha)

        horarios = list(Horario.objects.filter(
            distributivo_asignatura=da, dia_semana=dia_semana
        ).order_by('hora_inicio'))
        matriculas = list(AsistenciaService._matriculas_legalizadas(da.paralelo_id))

        clases = {
            c.horario_id: c for c in Clase.objects.filter(distributivo_asignatura=da, fecha=fecha)
        }
        asistencias = {
            (a.clase_id, a.matricula_id): a
            for a in Asistencia.objects.filter(clase__in=clases.values())
        }

        horarios_data = []
        for h in horarios:
            clase = clases.get(h.id)
            horarios_data.append({
                'id': h.id,
                'hora_inicio': h.hora_inicio.strftime('%H:%M'),
                'hora_fin': h.hora_fin.strftime('%H:%M'),
                'tipo': h.tipo_horario,
                'clase_id': clase.id if clase else None,
                'tema': clase.tema if clase else '',
                'descripcion': clase.descripcion if clase else '',
            })

        estudiantes_data = []
        for m in matriculas:
            celdas = {}
            for h in horarios:
                clase = clases.get(h.id)
                a = asistencias.get((clase.id, m.id)) if clase else None
                celdas[str(h.id)] = {
                    'asistencia_id': a.id,
                    'tipo': a.tipo,
                    'observacion': a.observacion,
                    'notificar': a.notificar,
                } if a else None
            estudiantes_data.append({
                'matricula_id': m.id,
                'estudiante_id': m.estudiante_id,
                'estudiante_nombre': f'{m.estudiante.apellidos} {m.estudiante.nombres}'.strip(),
                'identificacion': m.estudiante.identificacion,
                'asistencias': celdas,
            })

        return {
            'fecha': fecha.isoformat(),
            'dia_semana': dia_semana,
            'es_futura': fecha > date.today(),
            'periodo_academico': {'id': periodo.id, 'nombre': periodo.nombre} if periodo else None,
            'distributivo_asignatura_id': da.id,
            'asignatura': da.asignatura_ofertada.nombre if da.asignatura_ofertada else '',
            'paralelo': da.paralelo.nombre,
            'horarios': horarios_data,
            'estudiantes': estudiantes_data,
        }

    @staticmethod
    @transaction.atomic
    def marcar(data, user):
        """Registra o actualiza la asistencia de un estudiante en una clase (US-043)."""
        from apps.matricula.models import Matricula
        from apps.matricula.models.enums import MatriculaEstado

        fecha = AsistenciaService._parse_fecha(data.get('fecha'))
        if fecha > date.today():
            raise AsistenciaError('No se puede registrar asistencia en una fecha futura.')

        da = AsistenciaService._obtener_distributivo_asignatura(data.get('distributivo_asignatura_id'), user)
        horario = AsistenciaService._horario_de(da, data.get('horario_id'), fecha)

        tipo = data.get('tipo') or AsistenciaTipo.ASISTENCIA
        if tipo not in AsistenciaTipo.values:
            raise AsistenciaError(f'Tipo de asistencia inválido: {tipo}.')

        matricula = Matricula.objects.filter(pk=data.get('matricula_id')).first()
        if not matricula:
            raise AsistenciaError('La matrícula no existe.', 404)
        if matricula.estado != MatriculaEstado.LEGALIZADA or matricula.paralelo_id != da.paralelo_id:
            raise AsistenciaError('El estudiante no tiene una matrícula legalizada en este paralelo.')

        observacion = (data.get('observacion') or '').strip()[:500]
        notificar = bool(data.get('notificar')) and tipo in TIPOS_NOTIFICABLES

        clase = AsistenciaService._obtener_o_crear_clase(da, horario, fecha)
        asistencia, _ = Asistencia.objects.update_or_create(
            clase=clase,
            matricula=matricula,
            defaults={'tipo': tipo, 'observacion': observacion, 'notificar': notificar},
        )
        return AsistenciaSerializer(asistencia).data

    @staticmethod
    @transaction.atomic
    def marcar_todos(data, user):
        """Marca 'Asistencia' a todos los estudiantes que aún no tienen registro en la clase."""
        fecha = AsistenciaService._parse_fecha(data.get('fecha'))
        if fecha > date.today():
            raise AsistenciaError('No se puede registrar asistencia en una fecha futura.')
        da = AsistenciaService._obtener_distributivo_asignatura(data.get('distributivo_asignatura_id'), user)
        horario = AsistenciaService._horario_de(da, data.get('horario_id'), fecha)
        clase = AsistenciaService._obtener_o_crear_clase(da, horario, fecha)

        ya_registrados = set(clase.asistencias.values_list('matricula_id', flat=True))
        nuevos = [
            Asistencia(clase=clase, matricula=m, tipo=AsistenciaTipo.ASISTENCIA)
            for m in AsistenciaService._matriculas_legalizadas(da.paralelo_id)
            if m.id not in ya_registrados
        ]
        Asistencia.objects.bulk_create(nuevos)
        return {'clase_id': clase.id, 'registrados': len(nuevos)}

    @staticmethod
    @transaction.atomic
    def registrar_clase(data, user):
        """Guarda el tema y la descripción de la clase dictada (US-042)."""
        fecha = AsistenciaService._parse_fecha(data.get('fecha'))
        da = AsistenciaService._obtener_distributivo_asignatura(data.get('distributivo_asignatura_id'), user)
        horario = AsistenciaService._horario_de(da, data.get('horario_id'), fecha)

        tema = (data.get('tema') or '').strip()
        if not tema:
            raise AsistenciaError('El tema de la clase es obligatorio.')

        clase = AsistenciaService._obtener_o_crear_clase(da, horario, fecha)
        clase.tema = tema[:255]
        clase.descripcion = (data.get('descripcion') or '').strip()[:500]
        clase.save(update_fields=['tema', 'descripcion'])
        return {
            'clase_id': clase.id,
            'tema': clase.tema,
            'descripcion': clase.descripcion,
            'periodo_academico': clase.periodo_academico.nombre if clase.periodo_academico else None,
        }

    # ------------------------------------------------------------------
    # Estudiante
    # ------------------------------------------------------------------
    @staticmethod
    def mis_asistencias(user):
        """Asistencias del estudiante agrupadas por asignatura (US-046)."""
        from apps.matricula.models import Matricula
        from apps.matricula.models.enums import MatriculaEstado

        estudiante = getattr(user, 'perfil_estudiante', None)
        if not estudiante:
            raise AsistenciaError('Esta consulta es solo para estudiantes.', 403)

        matriculas = list(Matricula.objects.filter(
            estudiante=estudiante, estado=MatriculaEstado.LEGALIZADA
        ).order_by('-id'))
        if not matriculas:
            return {'matricula_id': None, 'asignaturas': []}

        # Año lectivo actual = matrícula legalizada más reciente
        matricula = matriculas[0]
        registros = Asistencia.objects.filter(matricula=matricula).select_related(
            'clase__distributivo_asignatura__asignatura_ofertada',
            'clase__distributivo_asignatura__distributivo__docente',
            'clase__periodo_academico',
        ).order_by('-clase__fecha', 'clase__hora_inicio')

        por_asignatura = {}
        for a in registros:
            da = a.clase.distributivo_asignatura
            item = por_asignatura.get(da.id)
            if not item:
                docente = da.distributivo.docente if da.distributivo else None
                item = por_asignatura[da.id] = {
                    'distributivo_asignatura_id': da.id,
                    'asignatura': da.asignatura_ofertada.nombre if da.asignatura_ofertada else '',
                    'docente': f'{docente.nombres} {docente.apellidos}' if docente else '',
                    'resumen': {t: 0 for t in AsistenciaTipo.values},
                    'total': 0,
                    'registros': [],
                }
            item['resumen'][a.tipo] += 1
            item['total'] += 1
            item['registros'].append({
                'fecha': a.clase.fecha.isoformat(),
                'hora_inicio': a.clase.hora_inicio.strftime('%H:%M'),
                'hora_fin': a.clase.hora_fin.strftime('%H:%M'),
                'tema': a.clase.tema,
                'periodo_academico': a.clase.periodo_academico.nombre if a.clase.periodo_academico else None,
                'tipo': a.tipo,
                'observacion': a.observacion,
            })

        asignaturas = list(por_asignatura.values())
        for item in asignaturas:
            presentes = item['resumen'][AsistenciaTipo.ASISTENCIA] + item['resumen'][AsistenciaTipo.ATRASADO]
            item['porcentaje_asistencia'] = round(presentes * 100 / item['total'], 1) if item['total'] else None
        asignaturas.sort(key=lambda x: x['asignatura'])
        return {'matricula_id': matricula.id, 'asignaturas': asignaturas}
