from rest_framework.response import Response
from rest_framework.views import APIView

from apps.calificaciones.permissions import EsDocente
from apps.calificaciones.services.matriz_service import MatrizService


class MisAsignaturasDocenteView(APIView):
    """
    GET /api/calificaciones/distributivo/docente/[?anio_lectivo=<id>]

    Reemplaza a DistributivoDocenteView (que consultaba campos inexistentes de
    DistributivoAsignatura y fallaba siempre). Conserva el nombre de ruta y la forma
    {"distributivos": [...]} para que el frontend actual siga funcionando.
    """
    permission_classes = [EsDocente]

    def get(self, request):
        docente = request.user.perfil_docente          # request.user es una Cuenta
        anio = request.query_params.get('anio_lectivo')
        data = MatrizService().listar_asignaturas_docente(
            docente, anio_lectivo_id=int(anio) if anio and anio.isdigit() else None
        )
        return Response(data)


class MatrizCalificacionesView(APIView):
    """
    GET /api/calificaciones/docente/asignaturas/<id>/matriz/

    Estudiantes + períodos + actividades + notas + promedios + final + supletorio,
    todo de UNA asignatura que debe pertenecer al docente autenticado (404 si no).
    """
    permission_classes = [EsDocente]

    def get(self, request, distributivo_asignatura_id):
        docente = request.user.perfil_docente
        data = MatrizService().obtener_matriz(docente, distributivo_asignatura_id)
        return Response(data)