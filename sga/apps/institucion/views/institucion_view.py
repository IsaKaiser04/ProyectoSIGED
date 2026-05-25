from rest_framework import generics
from apps.institucion.models.institucion import Institucion
from apps.institucion.serializers import InstitucionSerializer
class InstitucionListCreateView(generics.ListCreateAPIView):
    """
    Vista genérica para listar las instituciones (GET) y crear una nueva (POST).
    """
    queryset = Institucion.objects.all()
    serializer_class = InstitucionSerializer


class InstitucionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista genérica para recuperar (GET), actualizar (PUT/PATCH) y eliminar (DELETE) una institución por su ID.
    """
    queryset = Institucion.objects.all()
    serializer_class = InstitucionSerializer