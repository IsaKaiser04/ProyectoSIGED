from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from datetime import datetime, date, time

from apps.asistencia.services.asistencia_service import AsistenciaService
from apps.asistencia.models import Asistencia, Clase
from apps.asistencia.serializers.asistencia_serializer import AsistenciaSerializer


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

    @action(detail=False, methods=['get'])
    def matriz(self, request):
        """Retorna la matriz: horarios x estudiantes para un distributivo_asignatura en una fecha."""
        das_id = request.query_params.get('distributivo_asignatura_id')
        fecha_str = request.query_params.get('fecha')
        if not das_id or not fecha_str:
            return Response({'error': 'distributivo_asignatura_id y fecha son obligatorios'}, status=400)

        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

        dia_semana_map = {
            0: 'LUNES', 1: 'MARTES', 2: 'MIERCOLES',
            3: 'JUEVES', 4: 'VIERNES', 5: 'SABADO', 6: 'DOMINGO'
        }
        dia_semana = dia_semana_map[fecha.weekday()]

        from apps.distributivos.models import Horario, DistributivoAsignatura
        from apps.matricula.models import Matricula

        horarios = Horario.objects.filter(
            distributivo_asignatura_id=das_id, dia_semana=dia_semana
        ).order_by('hora_inicio')

        if not horarios.exists():
            return Response({
                'fecha': fecha_str,
                'dia_semana': dia_semana,
                'horarios': [],
                'estudiantes': []
            })

        da = DistributivoAsignatura.objects.filter(pk=das_id).select_related(
            'distributivo__docente', 'asignatura_ofertada', 'paralelo'
        ).first()
        if not da:
            return Response({'error': 'DistributivoAsignatura no encontrado'}, status=404)

        matriculas = Matricula.objects.filter(
            paralelo=da.paralelo, estado='Legalizada'
        ).select_related('estudiante')

        # Obtener asistencias existentes para la fecha
        clases = Clase.objects.filter(
            distributivo_asignatura_id=das_id, fecha=fecha
        )
        clase_map = {c.horario_id: c for c in clases}
        horario_ids = [h.id for h in horarios]
        asistencias = Asistencia.objects.filter(
            clase_id__in=[c.id for c in clases],
            matricula_id__in=[m.id for m in matriculas]
        ) if clases else Asistencia.objects.none()
        asis_map = {}
        for a in asistencias:
            asis_map[(a.clase_id, a.matricula_id)] = a

        estudiantes_data = []
        for m in matriculas:
            nombre = f"{m.estudiante.nombres} {m.estudiante.apellidos}" if m.estudiante else "—"
            asistencias_dict = {}
            for h in horarios:
                clase = clase_map.get(h.id)
                if clase:
                    a = asis_map.get((clase.id, m.id))
                    asistencias_dict[str(h.id)] = {
                        'asistencia_id': a.id if a else None,
                        'tipo': a.tipo if a else None,
                        'observacion': a.observacion if a else '',
                        'notificar': a.notificar if a else False,
                    }
                else:
                    asistencias_dict[str(h.id)] = None
            estudiantes_data.append({
                'matricula_id': m.id,
                'estudiante_nombre': nombre,
                'asistencias': asistencias_dict,
            })

        horarios_data = [{
            'id': h.id,
            'dia_semana': h.dia_semana,
            'hora_inicio': str(h.hora_inicio)[:5],
            'hora_fin': str(h.hora_fin)[:5],
            'tipo': h.tipo_horario,
        } for h in horarios]

        return Response({
            'fecha': fecha_str,
            'dia_semana': dia_semana,
            'horarios': horarios_data,
            'estudiantes': estudiantes_data,
            'distributivo_asignatura_id': int(das_id),
            'asignatura': da.asignatura_ofertada.nombre if da.asignatura_ofertada else '',
            'paralelo': da.paralelo.nombre if da.paralelo else '',
        })

    @action(detail=False, methods=['post'])
    def marcar(self, request):
        """Marca la asistencia de un estudiante en una clase."""
        das_id = request.data.get('distributivo_asignatura_id')
        fecha_str = request.data.get('fecha')
        horario_id = request.data.get('horario_id')
        matricula_id = request.data.get('matricula_id')
        tipo = request.data.get('tipo', 'Asistencia')
        observacion = request.data.get('observacion', '')
        notificar = request.data.get('notificar', False)

        if not all([das_id, fecha_str, matricula_id]):
            return Response({'error': 'distributivo_asignatura_id, fecha y matricula_id son obligatorios'}, status=400)

        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Formato de fecha inválido'}, status=400)

        from apps.distributivos.models import Horario
        horario = Horario.objects.filter(pk=horario_id).first() if horario_id else None
        hora_inicio = horario.hora_inicio if horario else time(7, 0)
        hora_fin = horario.hora_fin if horario else time(7, 45)

        with transaction.atomic():
            clase = Clase.objects.filter(
                distributivo_asignatura_id=das_id,
                horario_id=horario_id,
                fecha=fecha,
            ).first()

            if not clase:
                clase = Clase.objects.create(
                    tema=f"Clase {fecha}",
                    descripcion="",
                    fecha=fecha,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                    distributivo_asignatura_id=das_id,
                    horario_id=horario_id or 0,
                    distributivo_evaluacion_id=0,
                )

            asistencia, created = Asistencia.objects.update_or_create(
                clase=clase,
                matricula_id=matricula_id,
                defaults={
                    'tipo': tipo,
                    'observacion': observacion,
                    'notificar': notificar,
                }
            )

        return Response(AsistenciaSerializer(asistencia).data)