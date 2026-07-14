class InstitucionFilterMixin:
    """
    Filtra automáticamente el queryset por institución según el JWT.

    - Admin Global (sin institucion_id en token) → ve todo
    - Otros roles → ven solo datos de su institución

    Uso para FK directo (ej: Estudiante, Docente):
        class MiVista(InstitucionFilterMixin, generics.ListCreateAPIView):
            pass  # usa 'institucion_id' por defecto

    Uso para FK indirecto (ej: Grado → PlanEstudio → Institucion):
        class MiVista(InstitucionFilterMixin, generics.ListCreateAPIView):
            institucion_lookup = 'planEstudio__institucion_id'

    Para herencia anidada más profunda:
        institucion_lookup = 'grado__planEstudio__institucion_id'
    """
    institucion_lookup = 'institucion_id'

    def get_queryset(self):
        qs = super().get_queryset()
        auth = getattr(self.request, 'auth', None)
        if auth and auth.get('institucion_id') is not None:
            qs = qs.filter(**{self.institucion_lookup: auth['institucion_id']})
        return qs

    def perform_create(self, serializer):
        auth = getattr(self.request, 'auth', None)
        if auth and auth.get('institucion_id') is not None and '__' not in self.institucion_lookup:
            serializer.save(institucion_id=auth['institucion_id'])
        else:
            super().perform_create(serializer)
