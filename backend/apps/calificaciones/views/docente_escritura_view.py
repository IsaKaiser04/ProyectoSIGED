"""
Endpoints de escritura del flujo "Registro de notas" del docente.

Antes existían CalificacionService.crear_actividad / registrar_nota pero ninguna vista
los usaba: el frontend escribía por los CRUD genéricos, que no asignan período, no
bloquean períodos cerrados y no aceptan fecha_entrega / tipo_calculo / peso.

Todas las rutas parten del docente autenticado (EsDocente) y devuelven 404 si la
asignatura o actividad no pertenece a su distributivo.
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.calificaciones.permissions import EsDocente
from apps.calificaciones.serializers.docente_escritura_serializer import (
    ActividadDocenteInputSerializer,
    ActividadDocenteSerializer,
    NotaInputSerializer,
    SupletorioInputSerializer,
)
from apps.calificaciones.services.calificacion_service import CalificacionService
from apps.calificaciones.services.matriz_service import MatrizService, _num
from apps.calificaciones.services.promedio_service import PromedioService


class ActividadDocenteCreateView(APIView):
    """POST /api/calificaciones/docente/asignaturas/<id>/actividades/"""
    permission_classes = [EsDocente]

    def post(self, request, distributivo_asignatura_id):
        entrada = ActividadDocenteInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        actividad = CalificacionService().crear_actividad(
            request.user.perfil_docente,
            distributivo_asignatura_id,
            **entrada.validated_data,
        )
        return Response(ActividadDocenteSerializer(actividad).data, status=status.HTTP_201_CREATED)


class ActividadDocenteDetailView(APIView):
    """PATCH / DELETE /api/calificaciones/docente/actividades/<id>/"""
    permission_classes = [EsDocente]

    def patch(self, request, actividad_id):
        entrada = ActividadDocenteInputSerializer(data=request.data, partial=True)
        entrada.is_valid(raise_exception=True)
        # Con partial=True los `default` no se aplican: solo llega lo que el cliente envió.
        actividad = CalificacionService().actualizar_actividad(
            request.user.perfil_docente, actividad_id, entrada.validated_data,
        )
        return Response(ActividadDocenteSerializer(actividad).data)

    def delete(self, request, actividad_id):
        CalificacionService().desactivar_actividad(request.user.perfil_docente, actividad_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotaDocenteView(APIView):
    """
    PUT /api/calificaciones/docente/actividades/<id>/nota/
    Crea o actualiza la nota de una matrícula y devuelve la fila recalculada.
    """
    permission_classes = [EsDocente]

    def put(self, request, actividad_id):
        entrada = NotaInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        servicio = CalificacionService()
        calificacion = servicio.registrar_nota(
            request.user.perfil_docente,
            actividad_id,
            entrada.validated_data['matricula'],
            entrada.validated_data['valor'],
            entrada.validated_data['observacion'],
        )
        fila = MatrizService(servicio.repo).fila_estudiante(
            calificacion.asignatura_evaluacion.distributivo_asignatura, calificacion.matricula,
        )
        return Response({
            'calificacion_id': calificacion.id,
            'actividad_id': calificacion.asignatura_evaluacion_id,
            'matricula_id': calificacion.matricula_id,
            'valor': _num(calificacion.valor),
            'cualitativa': PromedioService.cualitativa(calificacion.valor),
            'fila': fila,
        })


class SupletorioDocenteView(APIView):
    """
    PUT /api/calificaciones/docente/asignaturas/<id>/supletorio/
    Registra el supletorio de una matrícula y devuelve la fila con el estado final.
    """
    permission_classes = [EsDocente]

    def put(self, request, distributivo_asignatura_id):
        entrada = SupletorioInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        servicio = CalificacionService()
        da, matricula = servicio.registrar_supletorio(
            request.user.perfil_docente,
            distributivo_asignatura_id,
            entrada.validated_data['matricula'],
            entrada.validated_data['valor'],
            entrada.validated_data['observacion'],
        )
        return Response({'fila': MatrizService(servicio.repo).fila_estudiante(da, matricula)})
