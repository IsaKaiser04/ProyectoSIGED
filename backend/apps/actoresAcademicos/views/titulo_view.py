from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from apps.actoresAcademicos.models.titulo import Titulo
from apps.actoresAcademicos.serializers.titulo_serializer import TituloSerializer

class TituloListCreateView(ListCreateAPIView):
    # El select_related optimiza la consulta a la base de datos uniendo las tablas de un solo golpe
    queryset = Titulo.objects.select_related('docente', 'universidad').all()
    serializer_class = TituloSerializer

    def get_queryset(self):
        """
        Opcional: Si en el futuro quieres filtrar los títulos de un docente específico 
        pasándole un parámetro en la URL (?docente_id=1)
        """
        queryset = super().get_queryset()
        docente_id = self.request.query_params.get('docente_id')
        if docente_id:
            queryset = queryset.filter(docente_id=docente_id)
        return queryset


class TituloDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Titulo.objects.select_related('docente', 'universidad').all()
    serializer_class = TituloSerializer