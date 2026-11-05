from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.asistencia.services.asistencia_service import AsistenciaService, AsistenciaError
from apps.asistencia.services.reporte_asistencia_export import generar_excel, generar_pdf, nombre_archivo
from apps.asistencia.models import Asistencia
from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer


# formato -> (extensión, content type, generador) del reporte US-045
FORMATOS_REPORTE = {
    'excel': ('xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', generar_excel),
    'pdf': ('pdf', 'application/pdf', generar_pdf),
}


class AsistenciaViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response(AsistenciaService.list_all())

    def retrieve(self, request, pk=None):
        data = AsistenciaService.retrieve(pk)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def create(self, request):
        data, errors = AsistenciaService.create(request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        data, errors = AsistenciaService.update(pk, request.data)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        if not data:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        if not AsistenciaService.delete(pk):
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def por_clase(self, request):
        clase_id = request.query_params.get('clase_id')
        if not clase_id:
            return Response({'error': 'Debe proporcionar clase_id'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(clase_id=clase_id)
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=False, methods=['get'])
    def por_matricula(self, request):
        matricula_id = request.query_params.get('matricula_id')
        if not matricula_id:
            return Response({'error': 'Debe proporcionar matricula_id'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(matricula_id=matricula_id)
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        tipo = request.query_params.get('tipo')
        if not tipo:
            return Response({'error': 'Debe proporcionar tipo'}, status=status.HTTP_400_BAD_REQUEST)
        asistencias = Asistencia.objects.filter(tipo=tipo)
        return Response(AsistenciaSerializer(asistencias, many=True).data)

    @action(detail=True, methods=['get'])
    def incidencias(self, request, pk=None):
        asistencia = Asistencia.objects.filter(pk=pk).first()
        if not asistencia:
            return Response({'error': 'Asistencia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        from apps.asistencia.serializers.incidencia_serializer import IncidenciaSerializer
        return Response(IncidenciaSerializer(asistencia.incidencias.all(), many=True).data)

    # ------------------------------------------------------------------
    # Flujo de registro de asistencia (docente) y consulta (estudiante)
    # La lógica de negocio está en AsistenciaService.
    # ------------------------------------------------------------------
    @staticmethod
    def _ejecutar(funcion, *args):
        try:
            return Response(funcion(*args))
        except AsistenciaError as e:
            return Response({'error': e.mensaje}, status=e.status)

    @action(detail=False, methods=['get'], url_path='mis-asignaturas')
    def mis_asignaturas(self, request):
        """Asignaturas del distributivo del docente que inició sesión."""
        return self._ejecutar(AsistenciaService.mis_asignaturas, request.user)

    @action(detail=False, methods=['get'])
    def matriz(self, request):
        """Matriz horarios x estudiantes para una asignatura del distributivo en una fecha."""
        return self._ejecutar(
            AsistenciaService.matriz,
            request.query_params.get('distributivo_asignatura_id'),
            request.query_params.get('fecha'),
            request.user,
        )

    @action(detail=False, methods=['post'])
    def marcar(self, request):
        """Marca la asistencia de un estudiante en una clase (US-043)."""
        return self._ejecutar(AsistenciaService.marcar, request.data, request.user)

    @action(detail=False, methods=['post'], url_path='marcar-todos')
    def marcar_todos(self, request):
        """Marca 'Asistencia' a los estudiantes sin registro en la clase."""
        return self._ejecutar(AsistenciaService.marcar_todos, request.data, request.user)

    @action(detail=False, methods=['post'], url_path='registrar-clase')
    def registrar_clase(self, request):
        """Guarda el tema de la clase dictada (US-042)."""
        return self._ejecutar(AsistenciaService.registrar_clase, request.data, request.user)

    @action(detail=False, methods=['get'], url_path='mis-asistencias')
    def mis_asistencias(self, request):
        """Asistencias del estudiante que inició sesión (US-046)."""
        return self._ejecutar(AsistenciaService.mis_asistencias, request.user)

    @action(detail=False, methods=['get'])
    def reporte(self, request):
        """Reporte de asistencia por asignatura y período (US-045). formato=json|excel|pdf."""
        try:
            reporte = AsistenciaService.reporte_asignatura(
                request.query_params.get('distributivo_asignatura_id'),
                request.query_params.get('periodo_academico_id'),
                request.user,
            )
        except AsistenciaError as e:
            return Response({'error': e.mensaje}, status=e.status)

        formato = request.query_params.get('formato', 'json')
        if formato == 'json':
            return Response(reporte)
        if formato not in FORMATOS_REPORTE:
            return Response({'error': 'Formato inválido. Use json, excel o pdf.'}, status=status.HTTP_400_BAD_REQUEST)

        extension, content_type, generar = FORMATOS_REPORTE[formato]
        response = HttpResponse(generar(reporte), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{nombre_archivo(reporte, extension)}"'
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response
