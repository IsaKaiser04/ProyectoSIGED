from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from ..models import AsignaturaOfertada, GradoOfertado, OfertaAcademica
from ..serializers import AsignaturaOfertadaSerializer, GradoOfertadoSerializer, OfertaAcademicaSerializer


class OfertaAcademicaListCreateView(ListCreateAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer
    permission_classes = []


class OfertaAcademicaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = OfertaAcademica.objects.all()
    serializer_class = OfertaAcademicaSerializer
    permission_classes = []


class GradoOfertadoListCreateView(ListCreateAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer
    permission_classes = []


class GradoOfertadoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = GradoOfertado.objects.all()
    serializer_class = GradoOfertadoSerializer
    permission_classes = []


class AsignaturaOfertadaListCreateView(ListCreateAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer
    permission_classes = []


class AsignaturaOfertadaDetailView(RetrieveUpdateDestroyAPIView):
    queryset = AsignaturaOfertada.objects.all()
    serializer_class = AsignaturaOfertadaSerializer
    permission_classes = []
