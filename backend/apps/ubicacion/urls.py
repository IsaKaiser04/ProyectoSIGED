from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.ubicacion.views import (
    PaisViewSet,
    ProvinciaViewSet,
    CantonViewSet,
    ParroquiaViewSet,
    DireccionViewSet
)

# 🟢 Inicializamos el enrutador automático de DRF
router = DefaultRouter()

# 🟢 Registramos los controladores con su prefijo en la URL
router.register(r'paises', PaisViewSet, basename='pais')
router.register(r'provincias', ProvinciaViewSet, basename='provincia')
router.register(r'cantones', CantonViewSet, basename='canton')
router.register(r'parroquias', ParroquiaViewSet, basename='parroquia')
router.register(r'direcciones', DireccionViewSet, basename='direccion')

# 🟢 Las URLs de la app se acoplan directamente desde el router
urlpatterns = [
    path('', include(router.urls)),
]