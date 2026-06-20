from django.utils import timezone
from django.db import transaction
from apps.matricula.repositories.matricula_repository import MatriculaRepository
from apps.matricula.serializers.matricula_serializer import MatriculaSerializer
from apps.matricula.models import Matricula, Requisito
from apps.planificacion.models import Paralelo
import uuid

# Importamos los modelos de actores académicos para crear la cuenta
from apps.actoresAcademicos.models import Estudiante, Cuenta
from django.contrib.auth import get_user_model
User = get_user_model()


class MatriculaService:
    @staticmethod
    def list_all():
        return MatriculaSerializer(MatriculaRepository.get_all(), many=True).data

    @staticmethod
    def retrieve(pk):
        matricula = MatriculaRepository.get_by_id(pk)
        return MatriculaSerializer(matricula).data if matricula else None

    @staticmethod
    def create(data, user_id=None):
        estudiante_id = data.get('estudiante_id')
        periodo_id = data.get('matricula_periodo')
        if estudiante_id and periodo_id:
            ya_matriculado = Matricula.objects.filter(
                estudiante_id=estudiante_id,
                matricula_periodo_id=periodo_id,
                estado=Matricula.MatriculaEstado.LEGALIZADA
            ).exists()
            if ya_matriculado:
                return None, {"error": "El estudiante ya tiene una matrícula legalizada en este año lectivo."}

        serializer = MatriculaSerializer(data=data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            if user_id:
                validated_data['creado_por_id'] = user_id
            instance = MatriculaRepository.create(validated_data)
            return MatriculaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    def update(pk, data):
        matricula = MatriculaRepository.get_by_id(pk)
        if not matricula:
            return None, {"error": "Matrícula no encontrada"}
        serializer = MatriculaSerializer(matricula, data=data, partial=True)
        if serializer.is_valid():
            instance = MatriculaRepository.update(matricula, serializer.validated_data)
            return MatriculaSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    @transaction.atomic
    def legalizar(pk, user_id):
        try:
            matricula = Matricula.objects.select_for_update().get(pk=pk)
        except Matricula.DoesNotExist:
            return None, {"error": "Matrícula no encontrada"}

        if matricula.estado == Matricula.MatriculaEstado.LEGALIZADA:
            return None, {"error": "La matrícula ya está legalizada"}

        # 1. Validar Requisitos (No legalizar a ciegas)
        requisitos_pendientes = matricula.requisitos.exclude(estado=Requisito.RequisitoEstado.VALIDADO).count()
        if requisitos_pendientes > 0:
            return None, {"error": f"No se puede legalizar, hay {requisitos_pendientes} requisito(s) pendiente(s) o rechazado(s)."}

        # 2. Validar y actualizar Cupos
        try:
            paralelo = Paralelo.objects.select_for_update().get(pk=matricula.paralelo_id)
            if hasattr(paralelo, 'cupos_ocupados') and hasattr(paralelo, 'cupos_maximo'):
                if not matricula.exceder_cupo_autorizado:
                    if paralelo.cupos_ocupados >= paralelo.cupos_maximo:
                        return None, {"error": "El paralelo seleccionado no tiene cupos disponibles."}
                paralelo.cupos_ocupados += 1
                paralelo.save()
        except Paralelo.DoesNotExist:
            return None, {"error": "El paralelo asignado no existe en la base de datos."}

        # 3. Generar Código y Legalizar
        if not matricula.codigo_unico:
            anio_actual = timezone.now().year
            matricula.codigo_unico = f"MAT-{anio_actual}-{uuid.uuid4().hex[:6].upper()}"
            
        matricula.estado = Matricula.MatriculaEstado.LEGALIZADA
        matricula.legalizada_por_id = user_id
        matricula.save()

        # 4. CREACIÓN DE CUENTA DE USUARIO (RF-03, RF-04)
        # Solo se crea si el estudiante existe y no tiene cuenta asignada
        try:
            estudiante = Estudiante.objects.get(id=matricula.estudiante_id)
            if not hasattr(estudiante, 'cuenta') or not estudiante.cuenta:
                # Crear User base (Django auth)
                username = estudiante.identificacion
                password_temp = f"Siged{estudiante.identificacion[-4:]}" # Contraseña inicial sugerida
                user = User.objects.create_user(username=username, password=password_temp)
                
                # Crear Cuenta SIGED
                cuenta = Cuenta.objects.create(
                    usuario=user,
                    rol='ESTUDIANTE',
                    es_activo=True,
                    correo_institucional=f"{username}@institucion.edu.ec"
                )
                estudiante.cuenta = cuenta
                estudiante.save()
                
                # Aquí se dispararía el envío de correo con credenciales (RF-15)
                # send_mail(...)
        except Estudiante.DoesNotExist:
            pass # Si el estudiante no existe, se legaliza la matrícula pero no se crea cuenta
        except Exception as e:
            # Si hay error creando la cuenta, no revertimos la matrícula, pero lo registramos
            print(f"Error creando cuenta para matrícula {matricula.id}: {str(e)}")

        return MatriculaSerializer(matricula).data, None

    @staticmethod
    @transaction.atomic
    def anular(pk, motivo=""):
        try:
            matricula = Matricula.objects.select_for_update().get(pk=pk)
        except Matricula.DoesNotExist:
            return False, {"error": "Matrícula no encontrada"}

        if matricula.estado == Matricula.MatriculaEstado.LEGALIZADA:
            try:
                paralelo = Paralelo.objects.select_for_update().get(pk=matricula.paralelo_id)
                if hasattr(paralelo, 'cupos_ocupados') and paralelo.cupos_ocupados > 0:
                    paralelo.cupos_ocupados -= 1
                    paralelo.save()
            except Paralelo.DoesNotExist:
                pass

        matricula.estado = Matricula.MatriculaEstado.ANULADA
        matricula.save()
        return True, None

    @staticmethod
    def delete(pk):
        success, errors = MatriculaService.anular(pk)
        return success
