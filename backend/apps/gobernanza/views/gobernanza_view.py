from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from ..models.gobernanza import Gobernanza
from ..serializers.gobernanza_serializer import GobernanzaSerializer


class GobernanzaViewSet(viewsets.ViewSet):
    def _get_institucion_id(self, user):
        for perfil_attr in ['perfil_autoridad', 'perfil_secretaria', 'perfil_dece', 'perfil_docente']:
            if hasattr(user, perfil_attr):
                perfil = getattr(user, perfil_attr)
                if perfil:
                    return perfil.institucion_id
        return None

    def _get_queryset(self, request):
        qs = Gobernanza.objects.select_related(
            'institucion', 'anioLectivo'
        ).filter(es_activo=True)

        user = request.user
        if user.is_anonymous:
            return qs.none()

        inst_id = self._get_institucion_id(user)
        if inst_id:
            qs = qs.filter(institucion_id=inst_id)

        if hasattr(user, 'perfil_administrador'):
            return Gobernanza.objects.select_related('institucion', 'anioLectivo').filter(es_activo=True)

        return qs

    def list(self, request):
        return Response(GobernanzaSerializer(self._get_queryset(request), many=True).data)

    def retrieve(self, request, pk=None):
        try:
            instance = Gobernanza.objects.get(pk=pk, es_activo=True)
        except Gobernanza.DoesNotExist:
            return Response({'error': 'Documento no encontrado'}, status=404)
        return Response(GobernanzaSerializer(instance).data)

    def create(self, request):
        serializer = GobernanzaSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            inst_id = request.data.get('institucion') or self._get_institucion_id(request.user)
            anio_id = request.data.get('anioLectivo')
            from apps.planificacion.models import AnioLectivo
            if anio_id:
                try:
                    anio = AnioLectivo.objects.get(pk=anio_id)
                    if anio.estado == 'CERRADO':
                        return Response({'anioLectivo': ['El año lectivo está cerrado.']}, status=400)
                except AnioLectivo.DoesNotExist:
                    pass
            instance = serializer.save(institucion_id=inst_id)
            return Response(GobernanzaSerializer(instance).data, status=201)
        return Response(serializer.errors, status=400)

    def partial_update(self, request, pk=None):
        try:
            instance = Gobernanza.objects.get(pk=pk, es_activo=True)
        except Gobernanza.DoesNotExist:
            return Response({'error': 'Documento no encontrado'}, status=404)
        serializer = GobernanzaSerializer(instance, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            instance = serializer.save()
            return Response(GobernanzaSerializer(instance).data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        try:
            instance = Gobernanza.objects.get(pk=pk, es_activo=True)
        except Gobernanza.DoesNotExist:
            return Response({'error': 'Documento no encontrado'}, status=404)
        instance.es_activo = False
        instance.save(update_fields=['es_activo'])
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def por_anio_lectivo(self, request):
        anio_lectivo_id = request.query_params.get('anio_lectivo_id')
        if not anio_lectivo_id:
            return Response({'error': 'Parámetro anio_lectivo_id es obligatorio'}, status=400)

        qs = self._get_queryset(request).filter(anioLectivo_id=anio_lectivo_id)
        return Response(GobernanzaSerializer(qs, many=True).data)
