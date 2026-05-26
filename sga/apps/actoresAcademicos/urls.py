from django.urls import path
from apps.actoresAcademicos.views.administrador_view import AdministradorListCreateView, AdministradorDetailView
from apps.actoresAcademicos.views.estudiante_view import EstudianteListCreateView, EstudianteDetailView    
from apps.actoresAcademicos.views.docente_view import DocenteListCreateView, DocenteDetailView
from apps.actoresAcademicos.views.autoridad_view import AutoridadListCreateView, AutoridadDetailView
from apps.actoresAcademicos.views.secretaria_view import SecretariaListCreateView, SecretariaDetailView
from apps.actoresAcademicos.views.dece_view import DeceListCreateView, DeceDetailView
from apps.actoresAcademicos.views.cuenta_view import CuentaListAPIView,CuentaDetailUpdateDestroyAPIView

urlpatterns = [
    # ... tus rutas anteriores de estudiantes, docentes, etc. ...

    # Gestión de Cuentas del Sistema
    path('cuentas/', CuentaListAPIView.as_view(), name='cuenta-list'),
    path('cuentas/<int:pk>/', CuentaDetailUpdateDestroyAPIView.as_view(), name='cuenta-detail'),

    # Administradores
    path('administradores/', AdministradorListCreateView.as_view(), name='administrador-list-create'),
    path('administradores/<int:pk>/', AdministradorDetailView.as_view(), name='administrador-detail'),

    # Estudiantes
    path('estudiantes/', EstudianteListCreateView.as_view(), name='estudiante-list-create'),
    path('estudiantes/<int:pk>/', EstudianteDetailView.as_view(), name='estudiante-detail'),
    
    # Docentes
    path('docentes/', DocenteListCreateView.as_view(), name='docente-list-create'),
    path('docentes/<int:pk>/', DocenteDetailView.as_view(), name='docente-detail'),

    # Autoridades Académicas
    path('autoridades/', AutoridadListCreateView.as_view(), name='autoridad-list-create'),
    path('autoridades/<int:pk>/', AutoridadDetailView.as_view(), name='autoridad-detail'),

    # Secretarías
    path('secretarias/', SecretariaListCreateView.as_view(), name='secretaria-list-create'),
    path('secretarias/<int:pk>/', SecretariaDetailView.as_view(), name='secretaria-detail'),

    # DECE
    path('dece/', DeceListCreateView.as_view(), name='dece-list-create'),
    path('dece/<int:pk>/', DeceDetailView.as_view(), name='dece-detail'),
    
    # Gestión de Cuentas del Sistema
    path('cuentas/', CuentaListAPIView.as_view(), name='cuenta-list'),
    path('cuentas/<int:pk>/', CuentaDetailUpdateDestroyAPIView.as_view(), name='cuenta-detail'),
]