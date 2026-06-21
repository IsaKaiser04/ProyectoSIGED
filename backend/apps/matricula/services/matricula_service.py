from django.utils import timezone
from django.db import transaction
from apps.matricula.repositories.matricula_repository import MatriculaRepository
from apps.matricula.serializers.matricula_serializer import (
    MatriculaListSerializer,
    MatriculaDetailSerializer,
    MatriculaCreateSerializer
)
from apps.matricula.models import Matricula, Requisito, MatriculaEstado
import uuid


class MatriculaService:
    @staticmethod
    def list_all():
        instances = MatriculaRepository.get_all()
        return MatriculaListSerializer(instances, many=True).data

    @staticmethod
    def retrieve(pk):
        instance = MatriculaRepository.get_con_requisitos(pk)
        if not instance:
            return None
        return MatriculaDetailSerializer(instance).data

    @staticmethod
    def create(data, user_id=None):
        estudiante_id = data.get('estudiante_id')
        anio_lectivo_id = data.get('anio_lectivo_id')

        if estudiante_id and anio_lectivo_id:
            if MatriculaRepository.existe_legalizada(estudiante_id, anio_lectivo_id):
                return None, {"error": "El estudiante ya tiene una matrícula legalizada en este año lectivo."}

        serializer = MatriculaCreateSerializer(data=data)
        if serializer.is_valid():
            validated = serializer.validated_data
            if user_id:
                validated['creado_por_id'] = user_id
            instance = MatriculaRepository.create(validated)
            return MatriculaDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        matricula = MatriculaRepository.get_by_id(pk)
        if not matricula:
            return None, {"error": "Matrícula no encontrada"}
        allowed = ['estado', 'observaciones', 'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad', 'paralelo_id']
        filtered = {k: v for k, v in data.items() if k in allowed}
        instance = MatriculaRepository.update(matricula, filtered)
        return MatriculaDetailSerializer(MatriculaRepository.get_con_requisitos(pk)).data, None

    @staticmethod
    @transaction.atomic
    def legalizar(pk, user_id):
        try:
            matricula = Matricula.objects.select_for_update().get(pk=pk)
        except Matricula.DoesNotExist:
            return None, {"error": "Matrícula no encontrada"}

        if matricula.estado == MatriculaEstado.LEGALIZADA:
            return None, {"error": "La matrícula ya está legalizada"}

        # 1. Validar Requisitos
        pendientes = matricula.requisitos.exclude(estado='Validado').count()
        if pendientes > 0:
            return None, {"error": f"No se puede legalizar. Hay {pendientes} requisito(s) pendiente(s) o rechazado(s)."}

        # 2. Validar Cupos
        if matricula.paralelo_id and not matricula.exceder_cupo_autorizado:
            try:
                from apps.planificacion.models import Paralelo
                paralelo = Paralelo.objects.select_for_update().get(pk=matricula.paralelo_id)
                if hasattr(paralelo, 'cupos_ocupados') and hasattr(paralelo, 'cupos_maximo'):
                    if paralelo.cupos_ocupados >= paralelo.cupos_maximo:
                        return None, {"error": "El paralelo no tiene cupos disponibles."}
                    paralelo.cupos_ocupados += 1
                    paralelo.save()
            except Exception:
                pass

        # 3. Generar Codigo y Legalizar
        if not matricula.codigo_unico:
            anio = timezone.now().year
            matricula.codigo_unico = f"MAT-{anio}-{uuid.uuid4().hex[:6].upper()}"

        matricula.estado = MatriculaEstado.LEGALIZADA
        matricula.legalizada_por_id = user_id
        matricula.save()

        # 4. Crear cuenta de usuario
        try:
            from apps.actoresAcademicos.models import Estudiante, Cuenta
            from django.contrib.auth import get_user_model
            User = get_user_model()
            estudiante = Estudiante.objects.get(id=matricula.estudiante_id)
            if not hasattr(estudiante, 'cuenta') or not estudiante.cuenta:
                username = estudiante.identificacion
                password_temp = f"Siged{estudiante.identificacion[-4:]}"
                user = User.objects.create_user(username=username, password=password_temp)
                cuenta = Cuenta.objects.create(
                    usuario=user, rol='ESTUDIANTE', es_activo=True,
                    correo_institucional=f"{username}@institucion.edu.ec"
                )
                estudiante.cuenta = cuenta
                estudiante.save()
        except Exception:
            pass

        return MatriculaDetailSerializer(Matricula.objects.select_related('matricula_periodo').get(pk=pk)).data, None

    @staticmethod
    @transaction.atomic
    def anular(pk, motivo=""):
        try:
            matricula = Matricula.objects.select_for_update().get(pk=pk)
        except Matricula.DoesNotExist:
            return False, {"error": "Matrícula no encontrada"}

        if matricula.estado == MatriculaEstado.LEGALIZADA and matricula.paralelo_id:
            try:
                from apps.planificacion.models import Paralelo
                paralelo = Paralelo.objects.select_for_update().get(pk=matricula.paralelo_id)
                if hasattr(paralelo, 'cupos_ocupados') and paralelo.cupos_ocupados > 0:
                    paralelo.cupos_ocupados -= 1
                    paralelo.save()
            except Exception:
                pass

        matricula.estado = MatriculaEstado.ANULADA
        matricula.observaciones = f"ANULADA: {motivo}"
        matricula.save()
        return True, None

    @staticmethod
    def por_paralelo(paralelo_id):
        instances = MatriculaRepository.get_by_paralelo(paralelo_id)
        return MatriculaListSerializer(instances, many=True).data

    @staticmethod
    def por_estudiante(estudiante_id):
        instances = MatriculaRepository.get_by_estudiante(estudiante_id)
        return MatriculaListSerializer(instances, many=True).data

    @staticmethod
    def por_estado(estado):
        instances = MatriculaRepository.get_por_estado(estado)
        return MatriculaListSerializer(instances, many=True).data

    @staticmethod
    def por_periodo(periodo_id):
        instances = MatriculaRepository.get_por_periodo(periodo_id)
        return MatriculaListSerializer(instances, many=True).data

    @staticmethod
    def estadisticas():
        stats = MatriculaRepository.get_estadisticas_por_estado()
        resultado = {}
        for s in stats:
            resultado[s['estado']] = s['total']
        resultado['total'] = sum(resultado.values())
        return resultado
