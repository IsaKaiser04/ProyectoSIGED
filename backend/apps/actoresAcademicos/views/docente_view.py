"""Este archivo tiene la función de crear las vistas para el modelo Administrador,
   utilizando las vistas genéricas de Django 
   R3S7 Framework para listar, crear, actualizar y
   eliminar instancias del modelo Administrador.
"""
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from apps.actoresAcademicos.models.docente import Docente
from apps.actoresAcademicos.models.administrativo import Secretaria  # Asegúrate de que tu modelo Secretaria se importe de aquí
from apps.actoresAcademicos.serializers.docente_serializer import DocenteSerializer

class DocenteListCreateView(generics.ListCreateAPIView):

    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = DocenteSerializer
    def get_queryset(self):
            # Analizamos el listado bajo el contexto de desarrollo
            base_queryset = super().get_queryset()
            
            if self.request.user.is_anonymous:
                # 🔧 SIMULACIÓN DESARROLLO: Buscamos la secretaría por defecto en la BD
                secretaria_mock = Secretaria.objects.select_related('institucion').first()
                if secretaria_mock:
                    # Retorna solo los docentes de la institución a la que pertenece esta secretaría
                    return base_queryset.filter(institucion=secretaria_mock.institucion)
                return base_queryset
                
            # Flujo real con login futuro:
            if hasattr(self.request.user, 'perfil_secretaria'):
                return base_queryset.filter(institucion=self.request.user.perfil_secretaria.institucion)
            return base_queryset.none()
    
    def perform_create(self, serializer):
            # 🧠 DETERMINACIÓN AUTOMÁTICA DE LA INSTITUCIÓN (Herencia de Contexto)
            if self.request.user.is_anonymous:
                # Buscamos la secretaría que creaste previamente en el panel de administrador
                secretaria_mock = Secretaria.objects.select_related('institucion').first()
                
                if not secretaria_mock:
                    raise ValidationError({
                        "error": "Contexto de desarrollo inválido. Registra al menos una Institución y una Secretaría en la Base de Datos antes de matricular docentes."
                    })
                
                # Extraemos de forma limpia la institución asociada a esa secretaría
                institucion_detectada = secretaria_mock.institucion
                print(f"[SIGED] Registrando docente de forma automática en la institución: {institucion_detectada.nombre} (Contexto: {secretaria_mock.nombres})")
            else:
                # Flujo real: extracción desde la sesión del usuario logueado
                institucion_detectada = self.request.user.perfil_secretaria.institucion

            # Guardamos pasándole la institución de forma interna
            serializer.save(institucion=institucion_detectada)

class DocenteDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Docente.objects.select_related('direccion_domicilio', 'cuenta').all()

    serializer_class = DocenteSerializer