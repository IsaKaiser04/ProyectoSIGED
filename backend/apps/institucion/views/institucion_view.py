from rest_framework import generics
from apps.institucion.models.institucion import Institucion
from apps.institucion.serializers import InstitucionSerializer

class InstitucionListCreateView(generics.ListCreateAPIView):
    """
    Vista genérica para listar las instituciones (GET) y crear una nueva (POST).
    Trae de forma optimizada la dirección física y el árbol geográfico completo.
    """
    queryset = Institucion.objects.select_related(
        'direccion__parroquia__canton__provincia__pais'
    ).all()
    serializer_class = InstitucionSerializer


class InstitucionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista genérica para recuperar (GET), actualizar (PUT/PATCH) y eliminar (DELETE) una institución por su ID.
    """
    queryset = Institucion.objects.select_related(
        'direccion__parroquia__canton__provincia__pais'
    ).all()
    serializer_class = InstitucionSerializer