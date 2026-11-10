"""
Rúbrica de actividades del año lectivo (EvaluacionLibro + secciones EvaluacionCategoria).

La configura Autoridad o Secretaría y aplica a todos los grados y a todos los períodos
del año. Reglas:
  - Al menos una sección, nombres únicos, cada peso > 0 y la suma = 100 %.
  - Cuando algún período del año ya cerró, solo se pueden renombrar o reordenar
    secciones: cambiar pesos, agregar o quitar cambiaría notas ya cerradas.
  - Una sección con actividades no se puede quitar.
"""
from decimal import Decimal

from django.db import transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.evaluacionLibro import EvaluacionLibro
from apps.calificaciones.repositories.matriz_repository import MatrizRepository
from apps.calificaciones.services.periodo_service import PeriodoService
from apps.calificaciones.services.promedio_service import TOLERANCIA_PESOS, PromedioService
from apps.distributivos.models import DistributivoAsignatura
from apps.planificacion.models import AnioLectivo, PeriodoAcademico

# Mismo criterio que apps/gobernanza/views/gobernanza_view.py
PERFILES_CON_INSTITUCION = ('perfil_autoridad', 'perfil_secretaria', 'perfil_docente')


class RubricaService:

    def __init__(self, repository=None):
        self.repo = repository or MatrizRepository()

    # ------------------------------------------------------------------ #
    # Acceso
    # ------------------------------------------------------------------ #
    @staticmethod
    def institucion_del_usuario(user):
        for perfil_attr in PERFILES_CON_INSTITUCION:
            perfil = getattr(user, perfil_attr, None)
            if perfil and perfil.institucion_id:
                return perfil.institucion_id
        return None

    def anio_del_usuario(self, user, anio_lectivo_id):
        """Año lectivo de la institución del usuario; 404 si es de otra o no existe."""
        institucion_id = self.institucion_del_usuario(user)
        anio = None
        if institucion_id and anio_lectivo_id:
            anio = AnioLectivo.objects.filter(pk=anio_lectivo_id, institucion_id=institucion_id).first()
        if anio is None:
            raise NotFound('Año lectivo no encontrado en tu institución.')
        return anio

    # ------------------------------------------------------------------ #
    # Lectura
    # ------------------------------------------------------------------ #
    @staticmethod
    def estructura_editable(anio):
        """False en cuanto un período del año haya cerrado."""
        periodos = PeriodoAcademico.objects.filter(anioLectivo=anio)
        return not any(PeriodoService.esta_cerrado(p) for p in periodos)

    def obtener(self, anio):
        libro = EvaluacionLibro.objects.filter(anio_lectivo=anio).first()
        secciones = list(libro.secciones.all()) if libro else []
        con_actividades = set(
            AsignaturaEvaluacion.objects
            .filter(evaluacion_categoria__in=secciones)
            .values_list('evaluacion_categoria_id', flat=True)
        )
        return {
            'anio_lectivo': {'id': anio.id, 'nombre': anio.nombre},
            'configurada': bool(secciones),
            'estructura_editable': self.estructura_editable(anio),
            'secciones': [
                {
                    'id': s.id,
                    'nombre': s.nombre,
                    'peso': float(s.peso),
                    'orden': s.orden,
                    'tiene_actividades': s.id in con_actividades,
                }
                for s in secciones
            ],
        }

    # ------------------------------------------------------------------ #
    # Escritura
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def guardar(self, anio, datos):
        """
        Reemplaza las secciones de la rúbrica por `datos` (lista de dicts con id opcional,
        nombre, peso y orden). Las secciones existentes que no vengan se eliminan.
        """
        self._validar_datos(datos)

        libro, _ = EvaluacionLibro.objects.get_or_create(
            anio_lectivo=anio,
            defaults={'nombre': f'Rúbrica de actividades {anio.nombre}'},
        )
        existentes = {s.id: s for s in libro.secciones.all()}

        ids_recibidos = [d['id'] for d in datos if d.get('id')]
        ajenos = set(ids_recibidos) - set(existentes)
        if ajenos:
            raise ValidationError({'secciones': 'Hay secciones que no pertenecen a esta rúbrica.'})

        quitadas = [s for sid, s in existentes.items() if sid not in ids_recibidos]
        nuevas = [d for d in datos if not d.get('id')]
        pesos_cambiados = any(
            existentes[d['id']].peso != d['peso'] for d in datos if d.get('id')
        )
        cambia_calculo = bool(quitadas or nuevas or pesos_cambiados)

        if cambia_calculo and not self.estructura_editable(anio):
            raise PermissionDenied(
                'Un período de este año lectivo ya cerró: solo se pueden renombrar o '
                'reordenar las secciones. Cambiar pesos o secciones alteraría notas cerradas.'
            )

        con_actividades = [
            s.nombre for s in quitadas
            if AsignaturaEvaluacion.objects.filter(evaluacion_categoria=s).exists()
        ]
        if con_actividades:
            raise ValidationError({
                'secciones': 'No se puede quitar una sección que ya tiene actividades: '
                             + ', '.join(con_actividades) + '.'
            })

        EvaluacionCategoria.objects.filter(pk__in=[s.id for s in quitadas]).delete()
        for d in datos:
            if d.get('id'):
                s = existentes[d['id']]
                s.nombre, s.peso, s.orden = d['nombre'], d['peso'], d['orden']
                s.save(update_fields=['nombre', 'peso', 'orden'])
            else:
                EvaluacionCategoria.objects.create(
                    libro=libro, nombre=d['nombre'], peso=d['peso'], orden=d['orden'],
                )

        if cambia_calculo:
            self._recalcular_anio(anio)
        return self.obtener(anio)

    def copiar(self, anio_destino, anio_origen):
        """Copia las secciones de otro año lectivo de la misma institución."""
        origen = EvaluacionLibro.objects.filter(anio_lectivo=anio_origen).first()
        secciones = list(origen.secciones.all()) if origen else []
        if not secciones:
            raise ValidationError({'anio_origen': f'El año "{anio_origen.nombre}" no tiene rúbrica configurada.'})
        datos = [{'nombre': s.nombre, 'peso': s.peso, 'orden': s.orden} for s in secciones]
        return self.guardar(anio_destino, datos)

    @staticmethod
    def _validar_datos(datos):
        if not datos:
            raise ValidationError({'secciones': 'La rúbrica necesita al menos una sección.'})
        nombres = [d['nombre'].strip().casefold() for d in datos]
        if any(not n for n in nombres):
            raise ValidationError({'secciones': 'Todas las secciones necesitan nombre.'})
        if len(set(nombres)) != len(nombres):
            raise ValidationError({'secciones': 'Hay secciones con el mismo nombre.'})
        for d in datos:
            d['nombre'] = d['nombre'].strip()
            if not (Decimal('0') < d['peso'] <= Decimal('1')):
                raise ValidationError({'secciones': f'El peso de "{d["nombre"]}" debe estar entre 0 % y 100 %.'})
        suma = sum((d['peso'] for d in datos), Decimal('0'))
        if abs(suma - Decimal('1')) > TOLERANCIA_PESOS:
            raise ValidationError({'secciones': f'Los pesos suman {suma * 100:.2f} % y deben sumar 100 %.'})

    def _recalcular_anio(self, anio):
        """Recalcula los promedios guardados de todas las asignaturas del año."""
        secciones = PromedioService.secciones_del_anio(anio.id)
        asignaturas = DistributivoAsignatura.objects.filter(
            distributivo__anio_lectivo=anio,
        ).select_related('distributivo')
        for da in asignaturas:
            periodo_ids = set(
                AsignaturaEvaluacion.objects
                .filter(distributivo_asignatura=da, activo=True, periodo_academico__isnull=False)
                .values_list('periodo_academico_id', flat=True)
            )
            if not periodo_ids:
                continue
            matriculas = list(self.repo.matriculas_del_curso(da))
            for periodo in PeriodoAcademico.objects.filter(pk__in=periodo_ids):
                for matricula in matriculas:
                    PromedioService.persistir_promedio_periodo(matricula, da, periodo, secciones)
