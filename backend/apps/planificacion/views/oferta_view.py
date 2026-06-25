from rest_framework import generics
from apps.actoresAcademicos.mixins import InstitucionFilterMixin
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada
from ..serializers.oferta_serializer import OfertaAcademicaSerializer, GradoOfertadoSerializer, AsignaturaOfertadaSerializer


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