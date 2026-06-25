from django.db import transaction
from ..models.oferta import GradoOfertado, AsignaturaOfertada
from ..repositories.oferta_repository import OfertaRepository
from ..serializers.oferta_serializer import GradoOfertadoSerializer, AsignaturaOfertadaSerializer


class OfertaService:
    @staticmethod
    def preview_asignaturas(grado_id):
        from ..models.plan_estudio import Asignatura
        qs = Asignatura.objects.filter(grado_id=grado_id).order_by('nombre')
        return list(qs.values('id', 'nombre', 'periodoPedagogicoSemanaMinimo'))

    @staticmethod
    @transaction.atomic
    def create_grado_con_asignaturas(grado_ofertado_data, asignatura_ids):
        serializer = GradoOfertadoSerializer(data=grado_ofertado_data)
        serializer.is_valid(raise_exception=True)
        grado_ofertado = serializer.save()

        from ..models.plan_estudio import Asignatura
        asignaturas = Asignatura.objects.filter(id__in=asignatura_ids, grado_id=grado_ofertado.grado_id)
        creadas = []
        for a in asignaturas:
            creadas.append(AsignaturaOfertada(
                nombre=a.nombre,
                gradoOfertado=grado_ofertado,
                asignatura=a,
            ))
        AsignaturaOfertada.objects.bulk_create(creadas)

        return GradoOfertadoSerializer(grado_ofertado).data

    @staticmethod
    @transaction.atomic
    def confirmar_asignaturas(grado_ofertado_id, asignatura_ids_a_mantener):
        grado_ofertado = GradoOfertado.objects.get(pk=grado_ofertado_id)
        AsignaturaOfertada.objects.filter(gradoOfertado=grado_ofertado).exclude(
            asignatura_id__in=asignatura_ids_a_mantener
        ).delete()
        return GradoOfertadoSerializer(grado_ofertado).data
