from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.matricula.views.matricula_periodo_view import MatriculaPeriodoViewSet
from apps.matricula.views.matricula_requisito_view import MatriculaRequisitoViewSet
from apps.matricula.views.matricula_view import MatriculaViewSet
from apps.matricula.views.requisito_view import RequisitoViewSet
from apps.matricula.views.retiro_view import RetiroViewSet
from apps.matricula.views.representante_view import RepresentanteViewSet

router = DefaultRouter()
router.register(r'periodos', MatriculaPeriodoViewSet, basename='matricula-periodo')
router.register(r'requisitos-config', MatriculaRequisitoViewSet, basename='matricula-requisito')
router.register(r'matriculas', MatriculaViewSet, basename='matricula')
router.register(r'requisitos', RequisitoViewSet, basename='requisito')
router.register(r'retiros', RetiroViewSet, basename='retiro')
router.register(r'representantes', RepresentanteViewSet, basename='representante')

urlpatterns = [
    path('', include(router.urls)),
]
