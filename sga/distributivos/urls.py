from rest_framework.routers import DefaultRouter
from .views import DistributivoViewSet

router = DefaultRouter()
router.register(r'distributivos', DistributivoViewSet)

urlpatterns = router.urls