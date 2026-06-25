from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GobernanzaViewSet

router = DefaultRouter()
router.register(r'gobernanzas', GobernanzaViewSet, basename='gobernanza')

app_name = 'gobernanza'

urlpatterns = [
    path('', include(router.urls)),
]
