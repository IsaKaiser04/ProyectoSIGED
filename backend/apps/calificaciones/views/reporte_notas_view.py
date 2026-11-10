"""
Reporte de notas por asignatura y paralelo (solo lectura).

GET /api/calificaciones/docente/reporte-notas/[?anio_lectivo=<id>]   -> su distributivo
GET /api/calificaciones/reporte-notas/[?anio_lectivo=<id>]           -> toda su institución

Sin `anio_lectivo` se usa el año vigente (el que contiene la fecha de hoy).
"""
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.actoresAcademicos.models.permissions import EsAutoridadAcademica, EsSecretaria
from apps.calificaciones.permissions import EsDocente
from apps.calificaciones.services.reporte_notas_service import ReporteNotasService


def _anio_param(request):
    anio = request.query_params.get('anio_lectivo')
    return int(anio) if anio and anio.isdigit() else None


class ReporteNotasDocenteView(APIView):
    permission_classes = [EsDocente]

    def get(self, request):
        data = ReporteNotasService().reporte_docente(request.user.perfil_docente, _anio_param(request))
        return Response(data)


class ReporteNotasInstitucionView(APIView):
    permission_classes = [EsAutoridadAcademica | EsSecretaria]

    def get(self, request):
        data = ReporteNotasService().reporte_institucion(request.user, _anio_param(request))
        return Response(data)
