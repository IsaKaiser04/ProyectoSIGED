from django.utils import timezone
from django.db import transaction
from apps.matricula.repositories.matricula_repository import MatriculaRepository
from apps.matricula.repositories.requisito_repository import RequisitoRepository
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
            instance = MatriculaRepository.create(validated)
            return MatriculaDetailSerializer(instance).data, None
        return None, serializer.errors

    @staticmethod
    @transaction.atomic
    def crear_con_requisitos(data):
        matricula_fields = {}
        requisito_files = {}

        for key, value in data.items():
            if key.startswith('requisito_'):
                req_id = key.replace('requisito_', '')
                if hasattr(value, 'read'):
                    requisito_files[req_id] = value
            elif key not in ('archivosRequisitos',):
                matricula_fields[key] = value

        serializer = MatriculaCreateSerializer(data=matricula_fields)
        if not serializer.is_valid():
            return None, serializer.errors

        instance = MatriculaRepository.create(serializer.validated_data)

        for req_id_str, archivo in requisito_files.items():
            RequisitoRepository.create({
                'matricula': instance,
                'matricula_requisito_id': int(req_id_str),
                'archivo': archivo,
                'estado': 'Pendiente',
            })

        return MatriculaDetailSerializer(
            MatriculaRepository.get_con_requisitos(instance.pk)
        ).data, None

    @staticmethod
    def update(pk, data):
        matricula = MatriculaRepository.get_by_id(pk)
        if not matricula:
            return None, {"error": "Matrícula no encontrada"}
        allowed = ['estado', 'tiene_discapacidad', 'tipo_discapacidad', 'grado_discapacidad', 'paralelo_id',
                    'asp_nombres', 'asp_apellidos', 'asp_fecha_nacimiento', 'asp_correo_personal']
        filtered = {k: v for k, v in data.items() if k in allowed}
        instance = MatriculaRepository.update(matricula, filtered)
        return MatriculaDetailSerializer(MatriculaRepository.get_con_requisitos(pk)).data, None

    @staticmethod
    @transaction.atomic
    def legalizar(pk, data, user_id):
        from apps.actoresAcademicos.models import Estudiante, Cuenta, Secretaria, Autoridad
        from apps.actoresAcademicos.models.enums import RolTipo
        from django.contrib.auth.hashers import make_password
        from apps.ubicacion.models import Direccion, Parroquia

        # Intentar obtener la matrícula (puede no existir si es local)
        matricula = None
        try:
            matricula = Matricula.objects.select_for_update().get(pk=pk)
        except Matricula.DoesNotExist:
            pass

        if matricula:
            if matricula.estado == MatriculaEstado.LEGALIZADA:
                return None, {"error": "La matrícula ya está legalizada"}

            pendientes = matricula.requisitos.exclude(estado='Validado').count()
            if pendientes > 0:
                return None, {"error": f"No se puede legalizar. Hay {pendientes} requisito(s) pendiente(s) o rechazado(s)."}

            if matricula.paralelo_id and not matricula.exceder_cupo_autorizado:
                try:
                    from apps.planificacion.models import Paralelo
                    paralelo = Paralelo.objects.select_for_update().get(pk=matricula.paralelo_id)
                    if paralelo.cuposOcupados >= paralelo.cuposMaximo:
                        return None, {"error": "El paralelo no tiene cupos disponibles."}
                    paralelo.cuposOcupados += 1
                    paralelo.save()
                except Paralelo.DoesNotExist:
                    pass

            if not matricula.codigo_unico:
                anio = timezone.now().year
                matricula.codigo_unico = f"MAT-{anio}-{uuid.uuid4().hex[:6].upper()}"

            matricula.estado = MatriculaEstado.LEGALIZADA
            matricula.save()

        # Procesar datos del estudiante recibidos del formulario
        credenciales = None
        estudiante_data = data.get('estudiante', {})
        if not estudiante_data:
            if matricula:
                resultado = MatriculaDetailSerializer(
                    Matricula.objects.select_related('matricula_periodo').get(pk=pk)
                ).data
                return resultado, None
            return None, {"error": "No se proporcionaron datos del estudiante"}

        institucion_id = estudiante_data.get('institucion_id')
        if not institucion_id:
            sec = Secretaria.objects.filter(cuenta_id=user_id).first()
            if sec:
                institucion_id = sec.institucion_id
            if not institucion_id:
                aut = Autoridad.objects.filter(cuenta_id=user_id).first()
                if aut:
                    institucion_id = aut.institucion_id

        direccion_data = estudiante_data.pop('direccion_domicilio', None)
        cuenta_data = estudiante_data.pop('cuenta', None)
        identificacion = estudiante_data.get('identificacion')

        existing = None
        if identificacion:
            existing = Estudiante.objects.filter(identificacion=identificacion).first()

        if direccion_data:
            parroquia_val = direccion_data.pop('parroquia', None)
            if isinstance(parroquia_val, int):
                direccion_data['parroquia'] = Parroquia.objects.get(id=parroquia_val)
            direccion = Direccion.objects.create(**direccion_data)
        else:
            direccion = None

        if cuenta_data:
            if Cuenta.objects.filter(nombre_usuario=cuenta_data['nombre_usuario']).exists():
                return None, {"error": "El nombre de usuario ya existe"}
            if Cuenta.objects.filter(correo_institucional=cuenta_data['correo_institucional']).exists():
                return None, {"error": "El correo institucional ya existe"}
            cuenta = Cuenta.objects.create(
                nombre_usuario=cuenta_data['nombre_usuario'],
                contrasena=make_password(cuenta_data['contrasena']),
                correo_institucional=cuenta_data['correo_institucional'],
                rol=RolTipo.ESTUDIANTE,
                es_activo=True
            )
            credenciales = {
                'usuario': cuenta_data['nombre_usuario'],
                'contrasena_temporal': cuenta_data['contrasena'],
                'correo_institucional': cuenta.correo_institucional,
                'estudiante_nombre': f"{estudiante_data.get('nombres', '')} {estudiante_data.get('apellidos', '')}".strip()
            }

        if existing:
            for field, value in estudiante_data.items():
                setattr(existing, field, value)
            if direccion:
                existing.direccion_domicilio = direccion
            if credenciales:
                existing.cuenta = cuenta
            existing.institucion_id = institucion_id
            existing.save()
            estudiante = existing
        else:
            estudiante = Estudiante.objects.create(
                direccion_domicilio=direccion,
                cuenta=cuenta if credenciales else None,
                institucion_id=institucion_id,
                **estudiante_data
            )

        if matricula:
            matricula.estudiante = estudiante
            matricula.institucion_id = institucion_id
            matricula.save()

        if matricula:
            resultado = MatriculaDetailSerializer(
                Matricula.objects.select_related('matricula_periodo').get(pk=pk)
            ).data
        else:
            resultado = {
                "mensaje": "Estudiante y cuenta creados exitosamente",
                "estudiante_id": estudiante.id,
            }
        if credenciales:
            resultado['cuenta_creada'] = credenciales
        return resultado, None

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
                if paralelo.cuposOcupados > 0:
                    paralelo.cuposOcupados -= 1
                    paralelo.save()
            except Paralelo.DoesNotExist:
                pass

        matricula.estado = MatriculaEstado.ANULADA
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

    @staticmethod
    def estudiantes_por_paralelo(paralelo_id):
        """Retorna estudiantes legalizados con sus datos personales para Asistencia."""
        return MatriculaRepository.get_estudiantes_por_paralelo(paralelo_id)
