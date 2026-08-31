from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.planificacion.models.paralelo import Paralelo
from apps.planificacion.models.plan_estudio import Grado
from apps.matricula.services.matricula_requisito_service import MatriculaRequisitoService

NIVELES_VALIDOS = [n[0] for n in Grado._meta.get_field('nivel').choices]


class MatriculaRequisitoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        educacion_nivel = request.query_params.get('educacion_nivel')
        paralelo_id = request.query_params.get('paralelo_id')

        if paralelo_id:
            paralelo = Paralelo.objects.filter(pk=paralelo_id).select_related(
                'gradoOfertado__grado'
            ).first()
            if paralelo:
                educacion_nivel = paralelo.gradoOfertado.grado.nivel

        if educacion_nivel and educacion_nivel not in NIVELES_VALIDOS:
            return Response({'error': 'educacion_nivel no válido'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(MatriculaRequisitoService.list_all(educacion_nivel))

    def retrieve(self, request, pk=None):
        data = MatriculaRequisitoService.retrieve(pk)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        secretaria = getattr(request.user, 'perfil_secretaria', None)
        if secretaria and secretaria.institucion_id:
            mutable_data['institucion_id'] = secretaria.institucion_id
        data, errors = MatriculaRequisitoService.create(mutable_data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = MatriculaRequisitoService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not MatriculaRequisitoService.delete(pk):
            return Response({'error': 'Requisito no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
