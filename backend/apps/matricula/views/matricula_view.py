from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.matricula.services.matricula_service import MatriculaService
from apps.matricula.models import Matricula


class MatriculaViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(MatriculaService.list_all())

    def retrieve(self, request, pk=None):
        data = MatriculaService.retrieve(pk)
        if not data:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = MatriculaService.create(request.data, user_id=request.user.id if request.user.is_authenticated else None)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = MatriculaService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not MatriculaService.delete(pk):
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def legalizar(self, request, pk=None):
        data, errors = MatriculaService.legalizar(pk, request.user.id if request.user.is_authenticated else None)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        motivo = request.data.get('motivo', 'Anulación sin motivo')
        success, errors = MatriculaService.anular(pk, motivo)
        if not success:
            return Response(errors, status=status.HTTP_404_NOT_FOUND)
        return Response({'mensaje': 'Matricula anulada y cupo liberado correctamente'})

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        data, errors = MatriculaService.update(pk, {'estado': Matricula.MatriculaEstado.RECHAZADA})
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data)

    @action(detail=False, methods=['get'])
    def por_estudiante(self, request):
        estudiante_id = request.query_params.get('estudiante_id')
        if not estudiante_id:
            return Response({'error': 'Debe proporcionar estudiante_id'}, status=status.HTTP_400_BAD_REQUEST)
        matriculas = Matricula.objects.filter(estudiante_id=estudiante_id)
        from apps.matricula.serializers.matricula_serializer import MatriculaSerializer
        return Response(MatriculaSerializer(matriculas, many=True).data)

    @action(detail=False, methods=['get'])
    def por_periodo(self, request):
        periodo_id = request.query_params.get('periodo_id')
        if not periodo_id:
            return Response({'error': 'Debe proporcionar periodo_id'}, status=status.HTTP_400_BAD_REQUEST)
        matriculas = Matricula.objects.filter(matricula_periodo_id=periodo_id)
        from apps.matricula.serializers.matricula_serializer import MatriculaSerializer
        return Response(MatriculaSerializer(matriculas, many=True).data)

    @action(detail=False, methods=['get'])
    def por_estado(self, request):
        estado = request.query_params.get('estado')
        if not estado:
            return Response({'error': 'Debe proporcionar estado'}, status=status.HTTP_400_BAD_REQUEST)
        matriculas = Matricula.objects.filter(estado=estado)
        from apps.matricula.serializers.matricula_serializer import MatriculaSerializer
        return Response(MatriculaSerializer(matriculas, many=True).data)

    @action(detail=True, methods=['get'])
    def requisitos(self, request, pk=None):
        matricula = Matricula.objects.filter(pk=pk).first()
        if not matricula:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        requisitos = matricula.requisitos.all()
        from apps.matricula.serializers.requisito_serializer import RequisitoSerializer
        return Response(RequisitoSerializer(requisitos, many=True).data)

    @action(detail=True, methods=['get'])
    def retiros(self, request, pk=None):
        matricula = Matricula.objects.filter(pk=pk).first()
        if not matricula:
            return Response({'error': 'Matricula no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        retiros = matricula.retiros.all()
        from apps.matricula.serializers.retiro_serializer import RetiroSerializer
        return Response(RetiroSerializer(retiros, many=True).data)
