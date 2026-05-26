"""Serilización: Toma objetos de la base de datos y los transforma 
   en JSON"""
# apps/ubicacion/serializers/__init__.py
from .pais_serializer import PaisSerializer
from .provincia_serializer import ProvinciaSerializer
from .canton_serializer import CantonSerializer
from .parroquia_serializer import ParroquiaSerializer
from .direccion_serializer import DireccionSerializer