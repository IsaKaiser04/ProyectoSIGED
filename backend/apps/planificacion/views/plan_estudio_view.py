from rest_framework import generics
from ..models.plan_estudio import PlanEstudio, Grado, Asignatura
from ..serializers.plan_estudio_serializer import PlanEstudioSerializer, GradoSerializer, AsignaturaSerializer


class PlanEstudioListCreateView(generics.ListCreateAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer

    def perform_create(self, serializer):
        # 1. Intentamos obtener la institución del usuario logueado en un futuro:
        # id_institucion = getattr(self.request.user, 'autoridad_perfil', None).institucion_id
        
        # 2. Por el momento, si no viene en el JSON ni en el usuario, 
        # le clavamos la institución con ID 1 por defecto.
        institucion_id = self.request.data.get('institucion', 1)
        
        # 3. Guardamos el registro inyectando de forma segura la relación
        serializer.save(institucion_id=institucion_id)

class PlanEstudioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanEstudio.objects.all()
    serializer_class = PlanEstudioSerializer


class GradoListCreateView(generics.ListCreateAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class GradoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class AsignaturaListCreateView(generics.ListCreateAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer


class AsignaturaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer