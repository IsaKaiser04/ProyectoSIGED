"""Este archivo tiene la función de crear las vistas para el modelo Administrador,
   utilizando las vistas genéricas de Django 
   R3S7 Framework para listar, crear, actualizar y
   eliminar instancias del modelo Administrador.
"""
from rest_framework import generics
from apps.actoresAcademicos.models.administrativo import Administrador
from ..serializers.administrativos_serializer import AdministradorSerializer

class AdministradorListCreateView(generics.ListCreateAPIView):

    queryset = Administrador.objects.all()

    serializer_class = AdministradorSerializer


class AdministradorDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Administrador.objects.all()

    serializer_class = AdministradorSerializer