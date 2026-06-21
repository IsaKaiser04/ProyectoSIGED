from django.urls import path
from .views import (
    GobernanzaListCreateView,
    GobernanzaDetailView,
)

urlpatterns = [
    path('gobernanzas/', GobernanzaListCreateView.as_view(), name='gobernanza-list-create'),
    path('gobernanzas/<int:pk>/', GobernanzaDetailView.as_view(), name='gobernanza-detail'),
    
]