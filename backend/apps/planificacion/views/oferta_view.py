from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada
from ..serializers.oferta_serializer import OfertaAcademicaSerializer, GradoOfertadoSerializer, AsignaturaOfertadaSerializer
from ..services.oferta_service import OfertaService


class OfertaAcademicaListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer
    institucion_lookup = 'anioLectivo__institucion_id'


class OfertaAcademicaDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer
    institucion_lookup = 'anioLectivo__institucion_id'


class GradoOfertadoListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'

    def get_queryset(self):
        qs = super().get_queryset()
        anio_lectivo_id = self.request.query_params.get('anio_lectivo_id')
        if anio_lectivo_id:
            qs = qs.filter(ofertaAcademica__anioLectivo_id=anio_lectivo_id)
        return qs


class GradoOfertadoDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer
    institucion_lookup = 'grado__planEstudio__institucion_id'


class AsignaturaOfertadaListCreateView(InstitucionFilterMixin, generics.ListCreateAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer
    institucion_lookup = 'gradoOfertado__grado__planEstudio__institucion_id'


class AsignaturaOfertadaDetailView(InstitucionFilterMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer
    institucion_lookup = 'gradoOfertado__grado__planEstudio__institucion_id'


@api_view(['GET'])
def preview_asignaturas(request):
    grado_id = request.query_params.get('grado_id')
    if not grado_id:
        return Response({'error': 'grado_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
    data = OfertaService.preview_asignaturas(grado_id)
    return Response(data)


@api_view(['POST'])
def crear_grado_con_asignaturas(request):
    grado_ofertado_data = request.data.get('gradoOfertado', {})
    asignatura_ids = request.data.get('asignaturaIds', [])
    try:
        result = OfertaService.create_grado_con_asignaturas(grado_ofertado_data, asignatura_ids)
        return Response(result, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)