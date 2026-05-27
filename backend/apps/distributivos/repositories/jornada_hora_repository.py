from ..models import JornadaHora


class JornadaHoraRepository:
    @staticmethod
    def all():
        return JornadaHora.objects.all()

    @staticmethod
    def get_by_id(pk):
        return JornadaHora.objects.filter(pk=pk).first()

    @staticmethod
    def filter_by_institucion(institucion_referencia):
        """Devuelve queryset filtrado por la referencia de la institución educativa."""
        if institucion_referencia is None:
            return JornadaHora.objects.all()
        return JornadaHora.objects.filter(institucion_educativa_referencia=institucion_referencia)

    @staticmethod
    def save(instance):
        instance.full_clean()
        instance.save()
        return instance