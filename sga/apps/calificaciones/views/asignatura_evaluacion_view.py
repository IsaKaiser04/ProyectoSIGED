from rest_framework import generics
from apps.calificaciones.models.asignaturaEvaluacion import AsignaturaEvaluacion
from apps.calificaciones.serializers.asignatura_evaluacion_serializer import AsignaturaEvaluacionSerializer

class AsignaturaEvaluacionListView(generics.ListCreateAPIView):
    queryset = AsignaturaEvaluacion.objects.all()
    serializer_class = AsignaturaEvaluacionSerializer

class AsignaturaEvaluacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AsignaturaEvaluacion.objects.all()
    serializer_class = AsignaturaEvaluacionSerializer