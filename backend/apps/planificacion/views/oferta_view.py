from rest_framework import generics
from ..models.oferta import OfertaAcademica, GradoOfertado, AsignaturaOfertada
from ..serializers.oferta_serializer import OfertaAcademicaSerializer, GradoOfertadoSerializer, AsignaturaOfertadaSerializer


class OfertaAcademicaListCreateView(generics.ListCreateAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer


class OfertaAcademicaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer


class GradoOfertadoListCreateView(generics.ListCreateAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer


class GradoOfertadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer


class AsignaturaOfertadaListCreateView(generics.ListCreateAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer


class AsignaturaOfertadaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer