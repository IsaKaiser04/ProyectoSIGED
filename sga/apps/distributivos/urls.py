from rest_framework.routers import DefaultRouter
from .views import DistributivoViewSet

app_name = 'distributivos'

router = DefaultRouter()
router.register(r'distributivos', DistributivoViewSet)

urlpatterns = router.urls