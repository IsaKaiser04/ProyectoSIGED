from rest_framework import generics
from ..models.gobernanza import Gobernanza
from ..serializers.gobernanza_serializer import GobernanzaSerializer
from apps.actoresAcademicos.models.administrativo import Autoridad


class GobernanzaListCreateView(generics.ListCreateAPIView):
    serializer_class = GobernanzaSerializer

    def get_queryset(self):
        qs = Gobernanza.objects.select_related(
            'institucion', 'anioLectivo'
        ).filter(es_activo=True)

        user = self.request.user

        if user.is_anonymous:
            return qs

        for perfil_attr in ['perfil_autoridad', 'perfil_secretaria', 'perfil_dece', 'perfil_docente']:
            if hasattr(user, perfil_attr):
                perfil = getattr(user, perfil_attr)
                return qs.filter(institucion=perfil.institucion)

        if hasattr(user, 'perfil_administrador'):
            return qs

        return qs.none()

    def perform_create(self, serializer):
        institucion = serializer.validated_data.get('institucion')
        if not institucion:
            from apps.actoresAcademicos.models.administrativo import Autoridad
            autoridad = Autoridad.objects.select_related('institucion').first()
            institucion = autoridad.institucion if autoridad else None
        serializer.save(institucion=institucion)


class GobernanzaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GobernanzaSerializer

    def get_queryset(self):
        return Gobernanza.objects.select_related(
            'institucion', 'anioLectivo'
        ).filter(es_activo=True)

    def perform_destroy(self, instance):
        instance.es_activo = False
        instance.save(update_fields=['es_activo'])
