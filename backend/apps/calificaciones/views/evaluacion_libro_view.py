"""
Rúbrica de actividades del año lectivo (US-032). La gestionan Autoridad y Secretaría,
solo para los años lectivos de su institución.

GET  /api/calificaciones/rubrica-actividades/?anio_lectivo=<id>
PUT  /api/calificaciones/rubrica-actividades/          {anio_lectivo, secciones: [...]}
POST /api/calificaciones/rubrica-actividades/copiar/   {anio_lectivo, anio_origen}
"""
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.actoresAcademicos.models.permissions import EsAutoridadAcademica, EsSecretaria
from apps.calificaciones.serializers.evaluacion_libro_serializer import (
    CopiarRubricaInputSerializer,
    RubricaActividadesInputSerializer,
)
from apps.calificaciones.services.rubrica_service import RubricaService


class RubricaActividadesView(APIView):
    permission_classes = [EsAutoridadAcademica | EsSecretaria]

    def get(self, request):
        anio = request.query_params.get('anio_lectivo')
        servicio = RubricaService()
        anio = servicio.anio_del_usuario(request.user, int(anio) if anio and anio.isdigit() else None)
        return Response(servicio.obtener(anio))

    def put(self, request):
        entrada = RubricaActividadesInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        servicio = RubricaService()
        anio = servicio.anio_del_usuario(request.user, entrada.validated_data['anio_lectivo'])
        datos = [dict(s) for s in entrada.validated_data['secciones']]
        return Response(servicio.guardar(anio, datos))


class CopiarRubricaActividadesView(APIView):
    permission_classes = [EsAutoridadAcademica | EsSecretaria]

    def post(self, request):
        entrada = CopiarRubricaInputSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        servicio = RubricaService()
        destino = servicio.anio_del_usuario(request.user, entrada.validated_data['anio_lectivo'])
        origen = servicio.anio_del_usuario(request.user, entrada.validated_data['anio_origen'])
        return Response(servicio.copiar(destino, origen))
