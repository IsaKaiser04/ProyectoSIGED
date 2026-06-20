from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from apps.asistencia.services.estadistica_service import EstadisticaService


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kpi_paralelo(request):
    """GET /api/asistencia/estadisticas/kpi_paralelo/?distributivo_id=1&fecha_inicio=2025-01-01&fecha_fin=2025-03-31
    
    KPIs principales para el dashboard de un paralelo.
    """
    distributivo_id = request.query_params.get('distributivo_id')
    if not distributivo_id:
        return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')

    return Response(EstadisticaService.get_kpi_paralelo(
        int(distributivo_id), fecha_inicio, fecha_fin
    ))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def tendencia_semanal(request):
    """GET /api/asistencia/estadisticas/tendencia_semanal/?distributivo_id=1&semanas=4
    
    Gráfica de tendencia de asistencia por semana.
    """
    distributivo_id = request.query_params.get('distributivo_id')
    if not distributivo_id:
        return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

    semanas = int(request.query_params.get('semanas', 4))
    return Response(EstadisticaService.get_tendencia_semanal(int(distributivo_id), semanas))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alumnos_riesgo(request):
    """GET /api/asistencia/estadisticas/alumnos_riesgo/?distributivo_id=1&umbral=10
    
    Alumnos que superan el umbral de inasistencias (default 10%).
    Alerta visual para el dashboard.
    """
    distributivo_id = request.query_params.get('distributivo_id')
    if not distributivo_id:
        return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

    umbral = float(request.query_params.get('umbral', 10.0))
    return Response(EstadisticaService.get_alumnos_riesgo(int(distributivo_id), umbral))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumen_semanal_docente(request):
    """GET /api/asistencia/estadisticas/resumen_semanal/?distributivo_id=1&fecha=2025-01-15
    
    Resumen semanal para el dashboard del docente.
    Incluye clases pendientes de registro.
    """
    distributivo_id = request.query_params.get('distributivo_id')
    if not distributivo_id:
        return Response({'error': 'Parámetro distributivo_id es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

    fecha = request.query_params.get('fecha')
    from datetime import datetime
    fecha_parsed = datetime.strptime(fecha, '%Y-%m-%d').date() if fecha else None

    return Response(EstadisticaService.get_resumen_semanal_docente(int(distributivo_id), fecha_parsed))
