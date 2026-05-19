from .models import Distributivo
from django.db.models import Q
from django.core.exceptions import ValidationError

class DistributivoService:
    """Servicio de lógica de negocio para Distributivos"""

    @staticmethod
    def crear_distributivo(data):
        """Crear un nuevo distributivo con validaciones"""
        try:
            distributivo = Distributivo.objects.create(**data)
            return {
                'success': True,
                'message': 'Distributivo creado correctamente',
                'data': distributivo
            }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error al crear distributivo: {str(e)}',
                'data': None
            }

    @staticmethod
    def obtener_distributivo(distributivo_id):
        """Obtener un distributivo por ID"""
        try:
            distributivo = Distributivo.objects.get(id=distributivo_id)
            return {
                'success': True,
                'message': 'Distributivo encontrado',
                'data': distributivo
            }
        except Distributivo.DoesNotExist:
            return {
                'success': False,
                'message': 'Distributivo no encontrado',
                'data': None
            }

    @staticmethod
    def listar_distributivos(filtros=None):
        """Listar distributivos con filtros opcionales"""
        queryset = Distributivo.objects.all()
        
        if filtros:
            if 'docente' in filtros:
                queryset = queryset.filter(docente__icontains=filtros['docente'])
            if 'materia' in filtros:
                queryset = queryset.filter(materia__icontains=filtros['materia'])
            if 'horario' in filtros:
                queryset = queryset.filter(horario__icontains=filtros['horario'])
        
        return {
            'success': True,
            'message': 'Listado de distributivos',
            'data': list(queryset)
        }

    @staticmethod
    def actualizar_distributivo(distributivo_id, data):
        """Actualizar un distributivo"""
        try:
            distributivo = Distributivo.objects.get(id=distributivo_id)
            
            # Actualizar campos
            for key, value in data.items():
                if hasattr(distributivo, key):
                    setattr(distributivo, key, value)
            
            distributivo.full_clean()
            distributivo.save()
            
            return {
                'success': True,
                'message': 'Distributivo actualizado correctamente',
                'data': distributivo
            }
        except Distributivo.DoesNotExist:
            return {
                'success': False,
                'message': 'Distributivo no encontrado',
                'data': None
            }
        except ValidationError as e:
            return {
                'success': False,
                'message': f'Error de validación: {str(e)}',
                'data': None
            }

    @staticmethod
    def eliminar_distributivo(distributivo_id):
        """Eliminar un distributivo"""
        try:
            distributivo = Distributivo.objects.get(id=distributivo_id)
            distributivo.delete()
            return {
                'success': True,
                'message': 'Distributivo eliminado correctamente',
                'data': None
            }
        except Distributivo.DoesNotExist:
            return {
                'success': False,
                'message': 'Distributivo no encontrado',
                'data': None
            }

    @staticmethod
    def obtener_distributivos_por_docente(docente):
        """Obtener todos los distributivos de un docente"""
        distributivos = Distributivo.objects.filter(docente__icontains=docente)
        return {
            'success': True,
            'message': f'Distributivos del docente {docente}',
            'data': list(distributivos)
        }