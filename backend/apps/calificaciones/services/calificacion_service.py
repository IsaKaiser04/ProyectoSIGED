from decimal import Decimal, InvalidOperation

from django.db import transaction
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.models.calificacion import Calificacion
from apps.calificaciones.models.calificacionHistorico import CalificacionHistorico
from apps.calificaciones.models.evaluacionCategoria import EvaluacionCategoria
from apps.calificaciones.models.supletorio import Supletorio
from apps.calificaciones.repositories.matriz_repository import MatrizRepository
from apps.calificaciones.services.periodo_service import PeriodoService
from apps.calificaciones.services.promedio_service import PromedioService


class CalificacionService:

    def __init__(self, repository=None):
        self.repo = repository or MatrizRepository()

    # ------------------------------------------------------------------ #
    # Actividades
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def crear_actividad(self, docente, distributivo_asignatura_id, nombre, fecha_entrega,
                        evaluacion_categoria, descripcion=''):
        """
        Regla 1: la asignatura debe ser del docente.
        Regla 2: el período se asigna solo, según fecha_entrega (400 si no existe).
        Regla 5: si ese período ya cerró -> 403.
        La sección debe ser de la rúbrica del año lectivo de la asignatura.
        """
        da = self.repo.obtener_asignatura_del_docente(docente, distributivo_asignatura_id)
        if da is None:
            raise NotFound('Asignatura no encontrada en tu distributivo.')

        seccion = self._seccion_de_la_rubrica(da, evaluacion_categoria)
        periodo = PeriodoService.asignar_periodo(da, fecha_entrega)
        PeriodoService.validar_periodo_abierto(periodo)

        actividad = AsignaturaEvaluacion.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            fecha_entrega=fecha_entrega,
            evaluacion_categoria=seccion,
            distributivo_asignatura=da,
            periodo_academico=periodo,
        )
        # Una actividad nueva cuenta como 0 para todos: cambia el promedio del período.
        self._recalcular_promedios(da, {periodo})
        return actividad

    @staticmethod
    def _seccion_de_la_rubrica(da, seccion_id):
        anio_id = da.distributivo.anio_lectivo_id
        seccion = EvaluacionCategoria.objects.filter(pk=seccion_id, libro__anio_lectivo_id=anio_id).first()
        if seccion is None:
            if not EvaluacionCategoria.objects.filter(libro__anio_lectivo_id=anio_id).exists():
                raise ValidationError({
                    'evaluacion_categoria': 'La autoridad aún no configura la rúbrica de '
                                            'actividades de este año lectivo.'
                })
            raise ValidationError({'evaluacion_categoria': 'La sección no pertenece a la rúbrica de este año.'})
        return seccion

    def _actividad_del_docente(self, docente, actividad_id):
        actividad = (
            AsignaturaEvaluacion.objects
            .select_related('distributivo_asignatura__distributivo', 'periodo_academico')
            .filter(
                pk=actividad_id,
                activo=True,
                distributivo_asignatura__distributivo__docente=docente,   # regla 1
            )
            .first()
        )
        if actividad is None:
            raise NotFound('Actividad no encontrada en tu distributivo.')
        return actividad

    @transaction.atomic
    def actualizar_actividad(self, docente, actividad_id, datos):
        """
        Edición parcial. Si cambia fecha_entrega se vuelve a asignar el período (regla 2).
        Tanto el período actual como el de destino deben estar abiertos (regla 5).
        """
        actividad = self._actividad_del_docente(docente, actividad_id)
        if actividad.periodo_academico_id:
            PeriodoService.validar_periodo_abierto(actividad.periodo_academico)

        da = actividad.distributivo_asignatura
        fecha_entrega = datos.get('fecha_entrega', actividad.fecha_entrega)
        periodo = PeriodoService.asignar_periodo(da, fecha_entrega)
        PeriodoService.validar_periodo_abierto(periodo)

        if 'evaluacion_categoria' in datos:
            actividad.evaluacion_categoria = self._seccion_de_la_rubrica(da, datos['evaluacion_categoria'])
        actividad.nombre = datos.get('nombre', actividad.nombre)
        actividad.descripcion = datos.get('descripcion', actividad.descripcion)
        actividad.fecha_entrega = fecha_entrega
        periodo_anterior = actividad.periodo_academico
        actividad.periodo_academico = periodo
        actividad.save()

        self._recalcular_promedios(da, {periodo_anterior, periodo})
        return actividad

    @transaction.atomic
    def desactivar_actividad(self, docente, actividad_id):
        """
        Baja lógica (activo=False): Calificacion protege la FK, así que un borrado físico
        fallaría en cuanto la actividad tenga notas. La matriz solo lista activas.
        """
        actividad = self._actividad_del_docente(docente, actividad_id)
        if actividad.periodo_academico_id:
            PeriodoService.validar_periodo_abierto(actividad.periodo_academico)
        actividad.activo = False
        actividad.save(update_fields=['activo'])
        self._recalcular_promedios(actividad.distributivo_asignatura, {actividad.periodo_academico})

    def _recalcular_promedios(self, da, periodos):
        secciones = PromedioService.secciones_del_anio(da.distributivo.anio_lectivo_id)
        matriculas = list(self.repo.matriculas_del_curso(da))
        for periodo in periodos:
            if periodo is None:
                continue
            for matricula in matriculas:
                PromedioService.persistir_promedio_periodo(matricula, da, periodo, secciones)

    # ------------------------------------------------------------------ #
    # Notas
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def registrar_nota(self, docente, actividad_id, matricula_id, valor, observacion=''):
        """
        Crea o actualiza la nota de un estudiante. El docente envía SOLO el número;
        la cualitativa se deriva al leer (regla 6).
        """
        actividad = self._actividad_del_docente(docente, actividad_id)       # regla 1
        if actividad.periodo_academico is None:
            raise ValidationError({'actividad': 'La actividad no tiene período académico asignado.'})
        PeriodoService.validar_periodo_abierto(actividad.periodo_academico)   # regla 5

        da = actividad.distributivo_asignatura
        matricula = self.repo.matriculas_del_curso(da).filter(pk=matricula_id).first()
        if matricula is None:
            raise ValidationError({'matricula': 'El estudiante no pertenece a este curso.'})

        valor = self._validar_valor(valor)

        calificacion = (
            Calificacion.objects.select_for_update()
            .filter(asignatura_evaluacion=actividad, matricula=matricula)
            .first()
        )
        if calificacion is None:
            calificacion = Calificacion.objects.create(
                asignatura_evaluacion=actividad, matricula=matricula,
                valor=valor, observacion=observacion,
            )
        else:
            # El histórico se guarda ANTES de sobrescribir.
            self._guardar_historico(calificacion, valor, observacion)
            calificacion.valor = valor
            calificacion.observacion = observacion
            calificacion.save()

        PromedioService.persistir_promedio_periodo(matricula, da, actividad.periodo_academico)
        return calificacion

    @staticmethod
    def _validar_valor(valor):
        try:
            valor = Decimal(str(valor)).quantize(Decimal('0.01'))
        except (InvalidOperation, ValueError):
            raise ValidationError({'valor': 'La nota debe ser numérica.'})
        if not (Decimal('0') <= valor <= Decimal('10')):
            raise ValidationError({'valor': 'La nota debe estar entre 0 y 10.'})
        return valor

    @staticmethod
    def _guardar_historico(calificacion, valor_nuevo, observacion=''):
        if calificacion.valor != valor_nuevo:
            CalificacionHistorico.objects.create(
                calificacion=calificacion,
                valor_anterior=calificacion.valor,
                valor_nuevo=valor_nuevo,
                observacion=observacion or calificacion.observacion,
            )

    # ------------------------------------------------------------------ #
    # Supletorio (regla 4)
    # ------------------------------------------------------------------ #
    @transaction.atomic
    def registrar_supletorio(self, docente, distributivo_asignatura_id, matricula_id,
                             valor, observacion=''):
        """
        Solo con TODOS los períodos del año cerrados y la nota final bajo la mínima.
        Devuelve la matrícula para que la vista arme la fila actualizada.
        """
        da = self.repo.obtener_asignatura_del_docente(docente, distributivo_asignatura_id)
        if da is None:
            raise NotFound('Asignatura no encontrada en tu distributivo.')

        periodos = list(self.repo.periodos_del_anio(da.distributivo.anio_lectivo_id))
        if not periodos or not all(PeriodoService.esta_cerrado(p) for p in periodos):
            raise PermissionDenied(
                'El supletorio se registra cuando todos los períodos del año están cerrados.'
            )

        matricula = self.repo.matriculas_del_curso(da).filter(pk=matricula_id).first()
        if matricula is None:
            raise ValidationError({'matricula': 'El estudiante no pertenece a este curso.'})

        # Import local: matriz_service importa este módulo de forma indirecta.
        from apps.calificaciones.services.matriz_service import MatrizService
        fila = MatrizService(self.repo).fila_estudiante(da, matricula)
        if not fila or not fila['supletorio_habilitado']:
            raise ValidationError({
                'valor': 'El estudiante no requiere supletorio: su nota final no está '
                         'por debajo de la mínima o el año no tiene todas sus notas.'
            })

        valor = self._validar_valor(valor)
        Supletorio.objects.update_or_create(
            matricula=matricula,
            distributivo_asignatura=da,
            defaults={'valor': valor, 'observacion': observacion},
        )
        return da, matricula
