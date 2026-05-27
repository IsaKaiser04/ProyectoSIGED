from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.matricula.services.matricula_periodo_service import MatriculaPeriodoService
from apps.matricula.models import MatriculaPeriodo
from django.utils import timezone


class MatriculaPeriodoViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(MatriculaPeriodoService.list_all())

    def retrieve(self, request, pk=None):
        data = MatriculaPeriodoService.retrieve(pk)
        if not data:
            return Response({'error': 'Periodo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = MatriculaPeriodoService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = MatriculaPeriodoService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Periodo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not MatriculaPeriodoService.delete(pk):
            return Response({'error': 'Periodo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def activos(self, request):
        ahora = timezone.now()
        periodos = MatriculaPeriodo.objects.filter(fecha_inicio__lte=ahora, fecha_fin__gte=ahora)
        from apps.matricula.serializers.matricula_periodo_serializer import MatriculaPeriodoSerializer
        return Response(MatriculaPeriodoSerializer(periodos, many=True).data)

    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        tipo = request.query_params.get('tipo')
        if not tipo:
            return Response({'error': 'Debe proporcionar tipo'}, status=status.HTTP_400_BAD_REQUEST)
        periodos = MatriculaPeriodo.objects.filter(tipo=tipo)
        from apps.matricula.serializers.matricula_periodo_serializer import MatriculaPeriodoSerializer
        return Response(MatriculaPeriodoSerializer(periodos, many=True).data)

    @action(detail=True, methods=['get'])
    def matriculas(self, request, pk=None):
        periodo = MatriculaPeriodo.objects.filter(pk=pk).first()
        if not periodo:
            return Response({'error': 'Periodo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        matriculas = periodo.matriculas.all()
        from apps.matricula.serializers.matricula_serializer import MatriculaSerializer
        return Response(MatriculaSerializer(matriculas, many=True).data)