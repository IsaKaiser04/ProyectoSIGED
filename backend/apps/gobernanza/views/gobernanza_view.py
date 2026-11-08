import unicodedata

from django.http import FileResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.actoresAcademicos.models.enums import RolTipo
from apps.actoresAcademicos.models.permissions import EsAutoridadAcademica, EsRol, EsSecretaria
from ..models.gobernanza import Gobernanza
from ..serializers.gobernanza_serializer import GobernanzaSerializer

# EUS-07: Autoridad y Secretaría gestionan; Docente solo consulta.
# El Administrador puede llamar a la lista, pero no tiene institución y la recibe vacía.
ROLES_LECTURA = (
    RolTipo.AUTORIDAD, RolTipo.SECRETARIA, RolTipo.DOCENTE, RolTipo.DOCENTE_TUTOR, RolTipo.ADMINISTRADOR,
)
ACCIONES_ESCRITURA = ('create', 'update', 'partial_update', 'destroy')
PERFILES_CON_INSTITUCION = ('perfil_autoridad', 'perfil_secretaria', 'perfil_docente')


class GobernanzaViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ACCIONES_ESCRITURA:
            return [(EsAutoridadAcademica | EsSecretaria)()]
        return [EsRol(*ROLES_LECTURA)]

    def _get_institucion_id(self, user):
        for perfil_attr in PERFILES_CON_INSTITUCION:
            perfil = getattr(user, perfil_attr, None)
            if perfil and perfil.institucion_id:
                return perfil.institucion_id
        return None

    def _get_queryset(self, request):
        """Solo documentos activos de la institución del usuario; sin institución, ninguno."""
        inst_id = self._get_institucion_id(request.user)
        if not inst_id:
            return Gobernanza.objects.none()
        return Gobernanza.objects.select_related('institucion', 'anioLectivo').filter(
            es_activo=True, institucion_id=inst_id
        )

    def _obtener(self, request, pk):
        """Documento de la institución del usuario, o None (404) si es de otra o no existe."""
        return self._get_queryset(request).filter(pk=pk).first()

    @staticmethod
    def _no_encontrado():
        return Response({'error': 'Documento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def _datos_sin_institucion(request):
        """Copia de los datos recibidos sin 'institucion': la institución no la elige el cliente."""
        return {k: v for k, v in request.data.items() if k != 'institucion'}

    def list(self, request):
        return Response(GobernanzaSerializer(self._get_queryset(request), many=True).data)

    def retrieve(self, request, pk=None):
        instance = self._obtener(request, pk)
        if not instance:
            return self._no_encontrado()
        return Response(GobernanzaSerializer(instance).data)

    def create(self, request):
        inst_id = self._get_institucion_id(request.user)
        if not inst_id:
            return Response({'error': 'Su usuario no tiene una institución asignada.'},
                            status=status.HTTP_400_BAD_REQUEST)
        data = self._datos_sin_institucion(request)
        data['institucion'] = inst_id
        serializer = GobernanzaSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            instance = serializer.save()
            return Response(GobernanzaSerializer(instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        instance = self._obtener(request, pk)
        if not instance:
            return self._no_encontrado()
        serializer = GobernanzaSerializer(
            instance, data=self._datos_sin_institucion(request), partial=True, context={'request': request}
        )
        if serializer.is_valid():
            instance = serializer.save()
            return Response(GobernanzaSerializer(instance).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        instance = self._obtener(request, pk)
        if not instance:
            return self._no_encontrado()
        instance.es_activo = False
        instance.save(update_fields=['es_activo'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_anio_lectivo(self, request):
        anio_lectivo_id = request.query_params.get('anio_lectivo_id')
        if not anio_lectivo_id:
            return Response({'error': 'Parámetro anio_lectivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        qs = self._get_queryset(request).filter(anioLectivo_id=anio_lectivo_id)
        return Response(GobernanzaSerializer(qs, many=True).data)

    @action(detail=False, methods=['get'], url_path='anio-actual')
    def anio_actual(self, request):
        """Documentos de la institución en su año lectivo ACTIVO (US-074)."""
        from apps.planificacion.models import AnioLectivo
        from apps.planificacion.models.enums import AnioLectivoEstado

        inst_id = self._get_institucion_id(request.user)
        anio = AnioLectivo.objects.filter(
            institucion_id=inst_id, estado=AnioLectivoEstado.ACTIVO
        ).order_by('-fechaInicio').first() if inst_id else None
        if not anio:
            return Response({'anio_lectivo': None, 'documentos': []})
        qs = self._get_queryset(request).filter(anioLectivo=anio)
        return Response({
            'anio_lectivo': {'id': anio.id, 'nombre': anio.nombre},
            'documentos': GobernanzaSerializer(qs, many=True).data,
        })

    @action(detail=True, methods=['get'])
    def archivo(self, request, pk=None):
        """PDF del documento, solo para usuarios de la misma institución. ?descargar=1 lo baja."""
        instance = self._obtener(request, pk)
        if not instance or not instance.archivo:
            return self._no_encontrado()
        nombre = f"{instance.get_gobernanzaTipo_display()} {instance.anioLectivo.nombre}.pdf"
        nombre = unicodedata.normalize('NFKD', nombre).encode('ascii', 'ignore').decode().replace(' ', '_')
        disposicion = 'attachment' if request.query_params.get('descargar') else 'inline'
        response = FileResponse(instance.archivo.open('rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'{disposicion}; filename="{nombre}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response
