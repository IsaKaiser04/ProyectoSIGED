"""Este archivo tiene la función de crear las vistas para el modelo Administrador,
   utilizando las vistas genéricas de Django 
   R3S7 Framework para listar, crear, actualizar y
   eliminar instancias del modelo Administrador.
"""
from rest_framework import generics
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.serializers.docente_serializer import DocenteSerializer

class DocenteListCreateView(generics.ListCreateAPIView):

    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = DocenteSerializer


class DocenteDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = DocenteSerializer