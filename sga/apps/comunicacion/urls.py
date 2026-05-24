from django.urls import path
from .views import (
    NotificacionListCreateView,
    NotificacionDetailView,
    DestinatarioListCreateView,
    DestinatarioDetailView,
)

urlpatterns = [
    path('notificaciones/', NotificacionListCreateView.as_view(), name='notificacion-list-create'),
    path('notificaciones/<int:pk>/', NotificacionDetailView.as_view(), name='notificacion-detail'),
    path('destinatarios/', DestinatarioListCreateView.as_view(), name='destinatario-list-create'),
    path('destinatarios/<int:pk>/', DestinatarioDetailView.as_view(), name='destinatario-detail'),
]